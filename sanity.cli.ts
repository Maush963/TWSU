import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./sanity/env";

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: { appId: "y42oh9x14od4ampuaxxp8jso" },
});
