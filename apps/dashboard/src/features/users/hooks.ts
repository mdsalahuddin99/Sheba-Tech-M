import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/shared/api-client/users";
import { userKeys } from "./queryKeys";
import { toast } from "sonner";
import { useAuth } from "@/features/auth";

export function useUsersQuery() {
  const { session, status } = useAuth();
  
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => usersApi.list(),
    enabled: status !== "loading" && !!session,
  });
}

export function useUpdateUserPermissions() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, permissions }: { userId: string; permissions: string[] }) =>
      usersApi.updatePermissions(userId, permissions),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Permissions updated successfully");
    },
    onError: (e: Error) => {
      toast.error(e.message || "Failed to update permissions");
    },
  });
}
