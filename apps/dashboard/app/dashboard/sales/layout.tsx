import { ReactNode } from "react";
import { PermissionGuard } from "@/features/auth/components/PermissionGuard";
import { ShieldAlert } from "lucide-react";

export default function SalesLayout({ children }: { children: ReactNode }) {
  return (
    <PermissionGuard 
      permission="sales:view"
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
          <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Access Denied</h2>
          <p className="text-slate-500 mt-2">You do not have permission to access the Sales module.</p>
        </div>
      }
    >
      {children}
    </PermissionGuard>
  );
}
