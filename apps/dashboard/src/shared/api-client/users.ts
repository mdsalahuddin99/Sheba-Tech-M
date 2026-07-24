import { apiFetch } from "./fetch";
import type { Paginated } from "../lib/types";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  permissions: string[];
  active: boolean;
  createdAt: string;
}

export const usersApi = {
  list: (): Promise<Paginated<User>> => apiFetch("/api/users"),

  updatePermissions: (userId: string, permissions: string[]): Promise<void> =>
    apiFetch(`/api/users?id=${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ permissions }),
    }),
};
