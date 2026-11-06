import { describe, expect, it, vi } from "vitest";
import { createBrevoProvider } from "@/lib/mail/brevo";
import { createMailchimpProvider } from "@/lib/mail/mailchimp";
import { createNoopProvider, selectMailProvider } from "@/lib/mail/provider";

const json = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), { status });

function fakeFetch(response: Response | Error) {
  return vi.fn<typeof fetch>(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
}

type Make = (fetchImpl: typeof fetch) => ReturnType<typeof createBrevoProvider>;
const cases: [string, Make, () => Response][] = [
  ["Brevo", (f) => createBrevoProvider("key", "7", f), () => json(400, { code: "duplicate_parameter" })],
  [
    "Mailchimp",
    (f) => createMailchimpProvider("key", "abc", "us21", f),
    () => json(400, { title: "Member Exists" }),
  ],
];

describe.each(cases)("proveedor %s", (_name, make, alreadyRegistered) => {
  it("da éxito cuando el proveedor acepta el correo", async () => {
    const fetchMock = fakeFetch(json(200));
    expect(await make(fetchMock).subscribe("a@b.co")).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("trata un correo ya registrado como éxito", async () => {
    expect(await make(fakeFetch(alreadyRegistered())).subscribe("a@b.co")).toEqual({ ok: true });
  });

  it("distingue rechazo, caída y tiempo agotado, sin reintentar", async () => {
    const failures: [Response | Error, string][] = [
      [json(401), "rejected"],
      [json(503), "unavailable"],
      [new Error("red"), "unavailable"],
      [new DOMException("tiempo", "TimeoutError"), "timeout"],
    ];
    for (const [response, reason] of failures) {
      const fetchMock = fakeFetch(response);
      expect(await make(fetchMock).subscribe("a@b.co")).toEqual({ ok: false, reason });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    }
  });
});

describe("contenido de la llamada", () => {
  it("Brevo manda la clave en la cabecera y la lista como número", async () => {
    const fetchMock = fakeFetch(json(201));
    await createBrevoProvider("secreto", "7", fetchMock).subscribe("a@b.co");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.brevo.com/v3/contacts");
    expect((init?.headers as Record<string, string>)["api-key"]).toBe("secreto");
    expect(JSON.parse(init?.body as string)).toMatchObject({ email: "a@b.co", listIds: [7] });
  });

  it("Mailchimp usa el prefijo del servidor y la lista en la URL", async () => {
    const fetchMock = fakeFetch(json(200));
    await createMailchimpProvider("secreto", "abc", "us21", fetchMock).subscribe("a@b.co");
    expect(fetchMock.mock.calls[0]![0]).toBe("https://us21.api.mailchimp.com/3.0/lists/abc/members");
  });
});

describe("selectMailProvider", () => {
  it("sin configuración no llama a la red y da éxito", async () => {
    const fetchMock = fakeFetch(json(200));
    for (const config of [{}, { apiKey: "k" }, { listId: "1" }]) {
      expect(await selectMailProvider(config, fetchMock).subscribe("a@b.co")).toEqual({ ok: true });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("con prefijo usa Mailchimp y sin él Brevo", async () => {
    const mailchimp = fakeFetch(json(200));
    await selectMailProvider({ apiKey: "k", listId: "l", serverPrefix: "us1" }, mailchimp).subscribe("a@b.co");
    expect(String(mailchimp.mock.calls[0]![0])).toContain("mailchimp.com");

    const brevo = fakeFetch(json(200));
    await selectMailProvider({ apiKey: "k", listId: "1" }, brevo).subscribe("a@b.co");
    expect(String(brevo.mock.calls[0]![0])).toContain("brevo.com");
  });
});

describe("createNoopProvider", () => {
  it("solo avisa en desarrollo", async () => {
    const warn = vi.fn();
    vi.stubEnv("NODE_ENV", "production");
    await createNoopProvider(warn).subscribe("a@b.co");
    expect(warn).not.toHaveBeenCalled();
    vi.stubEnv("NODE_ENV", "development");
    await createNoopProvider(warn).subscribe("a@b.co");
    expect(warn).toHaveBeenCalledTimes(1);
    vi.unstubAllEnvs();
  });
});
