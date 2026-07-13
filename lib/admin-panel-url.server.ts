import "server-only";

import { getAdminPanelUrl } from "./admin-panel-url";
import { getRequestHost } from "./request-host";

/** Admin panel URL derived from the current request host (server components). */
export async function getServerAdminPanelUrl(path = ""): Promise<string> {
  return getAdminPanelUrl(path, await getRequestHost());
}
