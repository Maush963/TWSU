"""Genera scripts/data/cities.json a partir de GeoNames (cities15000.txt, licencia CC BY 4.0).

Uso: python scripts/prepare-cities.py ruta/a/cities15000.txt
Toma una lista de destinos turísticos y la completa con las ciudades más pobladas. El continente sale
de los países de places.json, así coincide con el resto del atlas.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

TOTAL = 500
ROOT = Path(__file__).parent
places = json.loads((ROOT / "data" / "places.json").read_text(encoding="utf-8"))
continent_of = {p["countryCode"]: p["continent"] for p in places if p["kind"] == "country"}
existing = [(p["lat"], p["lng"]) for p in places if p["kind"] == "city"]

# (nombre en GeoNames, país). Destinos turísticos conocidos.
TOURIST = """
Cancun MX;Playa del Carmen MX;Tulum MX;Oaxaca MX;San Miguel de Allende MX;Merida MX;Puerto Vallarta MX;Los Cabos MX;Guanajuato MX;Cusco PE;Arequipa PE;Cartagena CO;Medellin CO;Quito EC;Cuenca EC;Havana CU;Varadero CU;Punta Cana DO;Nassau BS;Kingston JM;San Juan PR;Bridgetown BB;San Jose CR;Panama City PA;Antigua Guatemala GT;La Antigua Guatemala GT;Granada NI;Bariloche AR;San Carlos de Bariloche AR;Mendoza AR;Salta AR;Ushuaia AR;Valparaiso CL;Punta Arenas CL;Montevideo UY;Punta del Este UY;Florianopolis BR;Salvador BR;Foz do Iguacu BR;Honolulu US;Las Vegas US;Miami US;New Orleans US;San Francisco US;Los Angeles US;Orlando US;Seattle US;Boston US;Savannah US;Santa Fe US;Aspen US;Vancouver CA;Quebec CA;Banff CA;Montreal CA;Toronto CA;Reykjavik IS;Lisbon PT;Porto PT;Faro PT;Funchal PT;Seville ES;Barcelona ES;Granada ES;Valencia ES;San Sebastian ES;Palma ES;Ibiza ES;Florence IT;Venice IT;Rome IT;Naples IT;Siena IT;Verona IT;Bologna IT;Sorrento IT;Palermo IT;Cagliari IT;Nice FR;Lyon FR;Marseille FR;Bordeaux FR;Strasbourg FR;Cannes FR;Avignon FR;Edinburgh GB;Bath GB;Oxford GB;Cambridge GB;York GB;Dublin IE;Galway IE;Amsterdam NL;Bruges BE;Brussels BE;Luxembourg LU;Zurich CH;Geneva CH;Lucerne CH;Interlaken CH;Zermatt CH;Salzburg AT;Vienna AT;Innsbruck AT;Munich DE;Berlin DE;Hamburg DE;Heidelberg DE;Prague CZ;Cesky Krumlov CZ;Krakow PL;Budapest HU;Bratislava SK;Ljubljana SI;Dubrovnik HR;Split HR;Kotor ME;Tirana AL;Athens GR;Thessaloniki GR;Heraklion GR;Mykonos GR;Santorini GR;Fira GR;Valletta MT;Copenhagen DK;Stockholm SE;Oslo NO;Bergen NO;Tromso NO;Helsinki FI;Rovaniemi FI;Tallinn EE;Riga LV;Vilnius LT;Saint Petersburg RU;Kazan RU;Sochi RU;Tbilisi GE;Yerevan AM;Baku AZ;Antalya TR;Izmir TR;Cappadocia TR;Goreme TR;Bodrum TR;Marrakesh MA;Fes MA;Casablanca MA;Chefchaouen MA;Essaouira MA;Tunis TN;Sharm el-Sheikh EG;Luxor EG;Aswan EG;Hurghada EG;Alexandria EG;Zanzibar TZ;Arusha TZ;Mombasa KE;Victoria SC;Port Louis MU;Antananarivo MG;Livingstone ZM;Windhoek NA;Swakopmund NA;Maun BW;Kigali RW;Addis Ababa ET;Lalibela ET;Dakar SN;Accra GH;Lagos NG;Cape Town ZA;Durban ZA;Stellenbosch ZA;Port Elizabeth ZA;Jerusalem IL;Tel Aviv IL;Petra JO;Amman JO;Aqaba JO;Dubai AE;Abu Dhabi AE;Doha QA;Muscat OM;Manama BH;Kuwait City KW;Isfahan IR;Shiraz IR;Samarkand UZ;Bukhara UZ;Tashkent UZ;Almaty KZ;Bishkek KG;Kathmandu NP;Pokhara NP;Thimphu BT;Jaipur IN;Agra IN;Udaipur IN;Varanasi IN;Goa IN;Panaji IN;Kochi IN;Leh IN;Rishikesh IN;Amritsar IN;Jodhpur IN;Colombo LK;Kandy LK;Galle LK;Male MV;Siem Reap KH;Phnom Penh KH;Luang Prabang LA;Vientiane LA;Hanoi VN;Ho Chi Minh City VN;Da Nang VN;Hoi An VN;Hue VN;Bangkok TH;Chiang Mai TH;Phuket TH;Krabi TH;Pattaya TH;Ko Samui TH;Yangon MM;Mandalay MM;Bagan MM;Kuala Lumpur MY;George Town MY;Kota Kinabalu MY;Malacca MY;Singapore SG;Denpasar ID;Ubud ID;Yogyakarta ID;Manila PH;Cebu PH;Puerto Princesa PH;Hong Kong HK;Macau MO;Taipei TW;Kyoto JP;Osaka JP;Nara JP;Hiroshima JP;Nagoya JP;Sapporo JP;Fukuoka JP;Kanazawa JP;Naha JP;Seoul KR;Busan KR;Jeju KR;Beijing CN;Shanghai CN;Xi'an CN;Chengdu CN;Guilin CN;Lijiang CN;Hangzhou CN;Suzhou CN;Lhasa CN;Ulaanbaatar MN;Auckland NZ;Wellington NZ;Queenstown NZ;Christchurch NZ;Rotorua NZ;Melbourne AU;Brisbane AU;Perth AU;Cairns AU;Adelaide AU;Hobart AU;Darwin AU;Alice Springs AU;Gold Coast AU;Papeete PF;Suva FJ;Nadi FJ;Noumea NC;Apia WS;Port Vila VU
"""

# Destinos pequeños que GeoNames no trae en este archivo (menos de 15 mil habitantes).
MANUAL = [
    ("Los Cabos", "MX", 22.8905, -109.9167), ("Santorini", "GR", 36.4166, 25.4320),
    ("Mykonos", "GR", 37.4467, 25.3289), ("Petra", "JO", 30.3285, 35.4444),
    ("Queenstown", "NZ", -45.0312, 168.6626), ("Banff", "CA", 51.1784, -115.5708),
    ("Zermatt", "CH", 46.0207, 7.7491), ("Goreme", "TR", 38.6431, 34.8287),
    ("Kotor", "ME", 42.4247, 18.7712), ("Interlaken", "CH", 46.6863, 7.8632),
    ("Sorrento", "IT", 40.6263, 14.3758), ("Bagan", "MM", 21.1717, 94.8585),
]

def norm(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", text).strip()

def slug(text: str) -> str:
    return norm(text).replace(" ", "-")

rows = []
for line in Path(sys.argv[1]).read_text(encoding="utf-8").splitlines():
    f = line.split("\t")
    rows.append({
        "geonameid": f[0], "name": f[1], "ascii": f[2], "alts": set(map(norm, f[3].split(","))),
        "lat": float(f[4]), "lng": float(f[5]), "cc": f[8], "pop": int(f[14] or 0),
    })

chosen: dict[str, dict] = {}
def near_existing(row) -> bool:
    return any(abs(row["lat"] - a) < 0.3 and abs(row["lng"] - b) < 0.3 for a, b in existing)

def add(row) -> None:
    if row["cc"] in continent_of and not near_existing(row):
        chosen.setdefault(row["geonameid"], row)

missing = []
for item in filter(None, (s.strip() for s in TOURIST.replace("\n", "").split(";"))):
    name, cc = item.rsplit(" ", 1)
    key = norm(name)
    hits = [r for r in rows if r["cc"] == cc and (norm(r["name"]) == key or norm(r["ascii"]) == key)]
    hits = hits or [r for r in rows if r["cc"] == cc and key in r["alts"]]
    if hits:
        best = max(hits, key=lambda r: r["pop"])
        add(best)
    else:
        missing.append(item)

for name, cc, lat, lng in MANUAL:
    add({"geonameid": f"manual-{slug(name)}", "name": name, "ascii": name, "lat": lat, "lng": lng, "cc": cc, "pop": 0})

# Se completa hasta TOTAL con las más pobladas, con un tope por país para que China o India no copen la lista.
PER_COUNTRY = 12
for row in sorted(rows, key=lambda r: -r["pop"]):
    if len(chosen) >= TOTAL:
        break
    if sum(1 for r in chosen.values() if r["cc"] == row["cc"]) < PER_COUNTRY:
        add(row)
assert len(chosen) == TOTAL, len(chosen)
# El id lleva el país, así dos ciudades con el mismo nombre no chocan.
ids: dict[str, str] = {}
cities = [
    {
        "id": f"place-city-{slug(r['ascii'])}-{r['cc'].lower()}" + ("" if ids.setdefault(f"{slug(r['ascii'])}-{r['cc']}", r["geonameid"]) == r["geonameid"] else f"-{r['geonameid']}"),
        "countryCode": r["cc"],
        "name": r["name"],
        "continent": continent_of[r["cc"]],
        "lat": round(r["lat"], 4),
        "lng": round(r["lng"], 4),
        "kind": "city",
    }
    for r in sorted(chosen.values(), key=lambda r: (r["cc"], r["name"]))
]
(ROOT / "data" / "cities.json").write_text(json.dumps(cities, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{len(cities)} ciudades. Sin coincidencia: {', '.join(missing) or 'ninguna'}")
