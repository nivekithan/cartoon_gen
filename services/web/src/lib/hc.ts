import { hc as honoClient } from "hono/client";
import { AppType } from "./apiType";

export const hc = honoClient<AppType>(import.meta.env.VITE_BACKEND_API_URL);
