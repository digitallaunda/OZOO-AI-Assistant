import type { OzzoPluginApi } from "ozzo/plugin-sdk";
import { emptyPluginConfigSchema } from "ozzo/plugin-sdk";

import { createDiagnosticsOtelService } from "./src/service.js";

const plugin = {
  id: "diagnostics-otel",
  name: "Diagnostics OpenTelemetry",
  description: "Export diagnostics events to OpenTelemetry",
  configSchema: emptyPluginConfigSchema(),
  register(api: OzzoPluginApi) {
    api.registerService(createDiagnosticsOtelService());
  },
};

export default plugin;
