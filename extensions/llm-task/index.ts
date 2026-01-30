import type { OzzoPluginApi } from "../../src/plugins/types.js";

import { createLlmTaskTool } from "./src/llm-task-tool.js";

export default function register(api: OzzoPluginApi) {
  api.registerTool(createLlmTaskTool(api), { optional: true });
}
