import { hc } from "hono/client";
import type { AppType } from "../../api";
import { getAuthToken } from "./auth";

const client = hc<AppType>("/", {
  headers: (): Record<string, string> => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

export const api = client.api;
