"use client";

import type { ReactNode } from "react";
import { useHasPermission } from "../hooks";
import { useAuth } from "../AuthProvider";

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A wrapper component that conditionally renders its children 
 * based on whether the current user has the specified permission.
 * 
 * If the user has the permission (or is an ADMIN), `children` is rendered.
 * Otherwise, `fallback` (which defaults to null) is rendered.
 */
export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { status } = useAuth();
  const hasPermission = useHasPermission(permission);

  if (status === "loading") {
    return null;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
