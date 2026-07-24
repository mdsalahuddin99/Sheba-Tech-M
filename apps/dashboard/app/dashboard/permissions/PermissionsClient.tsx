"use client";

import { useState, useEffect, useMemo } from "react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Button } from "@/shared/ui/button";
import { LoadingButton } from "@/shared/ui/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { ShieldCheck, ShieldAlert, CheckSquare, Square } from "lucide-react";
import { useUsersQuery, useUpdateUserPermissions } from "@/features/users/hooks";
import { MODULES, type PermissionModule, type PermissionAction } from "@/shared/lib/permissions";
import { cn } from "@/shared/lib/utils";

export function PermissionsClient() {
  usePageTitle("Roles & Permissions");

  const { data: usersData, isLoading: usersLoading } = useUsersQuery();
  const updateMutation = useUpdateUserPermissions();

  const users = useMemo(() => usersData?.items || [], [usersData]);
  const cashiers = useMemo(() => users.filter((u) => u.role === "CASHIER"), [users]);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [permissions, setPermissions] = useState<Set<string>>(new Set());

  // Update local state when user selection changes
  useEffect(() => {
    if (selectedUserId) {
      const user = cashiers.find((u) => u.id === selectedUserId);
      if (user) {
        setPermissions(new Set(user.permissions || []));
      }
    } else {
      setPermissions(new Set());
    }
  }, [selectedUserId, cashiers]);

  const selectedUser = useMemo(() => cashiers.find((u) => u.id === selectedUserId), [cashiers, selectedUserId]);

  const togglePermission = (permStr: string) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permStr)) next.delete(permStr);
      else next.add(permStr);
      return next;
    });
  };

  const toggleModule = (modId: PermissionModule, allActions: readonly string[]) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      const allSelected = allActions.every((a) => next.has(`${modId}:${a}`));
      if (allSelected) {
        // Deselect all
        allActions.forEach((a) => next.delete(`${modId}:${a}`));
      } else {
        // Select all
        allActions.forEach((a) => next.add(`${modId}:${a}`));
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!selectedUserId) return;
    updateMutation.mutate({
      userId: selectedUserId,
      permissions: Array.from(permissions),
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-500" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage access control and feature permissions for cashiers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="bg-white shadow-sm h-10 border-slate-200 focus:ring-2 focus:ring-indigo-500/20">
                <SelectValue placeholder="Select Cashier..." />
              </SelectTrigger>
              <SelectContent>
                {usersLoading ? (
                  <SelectItem value="loading" disabled>Loading users...</SelectItem>
                ) : cashiers.length === 0 ? (
                  <SelectItem value="none" disabled>No cashiers found</SelectItem>
                ) : (
                  cashiers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <LoadingButton
            onClick={handleSave}
            loading={updateMutation.isPending}
            disabled={!selectedUserId}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-10"
          >
            Save Changes
          </LoadingButton>
        </div>
      </div>

      {/* Permissions Grid */}
      {!selectedUserId ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <ShieldAlert className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">No Cashier Selected</h3>
          <p className="text-sm text-slate-500 max-w-md mt-1">
            Please select a cashier from the dropdown menu above to view and modify their permissions.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-border flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-800">Permissions for {selectedUser?.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Toggle specific actions for each module below.</p>
            </div>
          </div>
          
          <div className="divide-y divide-border">
            {MODULES.map((mod) => {
              const allSelected = mod.actions.every((a) => permissions.has(`${mod.id}:${a}`));
              const someSelected = mod.actions.some((a) => permissions.has(`${mod.id}:${a}`));

              return (
                <div key={mod.id} className="p-4 md:p-5 hover:bg-slate-50/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Module Title & Select All */}
                    <div className="w-full md:w-1/3 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-700">{mod.label}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.id, mod.actions)}
                        className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
                      >
                        {allSelected ? (
                          <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
                        ) : someSelected ? (
                          <CheckSquare className="h-3.5 w-3.5 text-indigo-400 opacity-60" />
                        ) : (
                          <Square className="h-3.5 w-3.5" />
                        )}
                        Select All
                      </button>
                    </div>

                    {/* Actions Switches */}
                    <div className="w-full md:w-2/3 flex flex-wrap gap-x-6 gap-y-4">
                      {mod.actions.map((action) => {
                        const permStr = `${mod.id}:${action}`;
                        const isChecked = permissions.has(permStr);
                        
                        return (
                          <div key={permStr} className="flex items-center gap-2.5 min-w-[120px]">
                            <Switch
                              checked={isChecked}
                              onCheckedChange={() => togglePermission(permStr)}
                              className={cn(
                                "data-[state=checked]:bg-indigo-500",
                              )}
                            />
                            <span className={cn(
                              "text-sm font-medium capitalize",
                              isChecked ? "text-slate-800" : "text-slate-500"
                            )}>
                              {action}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
