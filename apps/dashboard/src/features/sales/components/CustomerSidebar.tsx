"use client";

import { Badge } from "@/shared/ui/badge";
import { CustomerSearch } from "./CustomerSearch";
import { formatCurrency } from "@/shared/lib/format";
import { History, User, Phone, Mail, FileText, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services";
import { Button } from "@/shared/ui/button";
import { customersApi } from "@/shared/api-client/customers";
import type { Customer } from "@/features/customers/types";
interface CustomerSidebarProps {
  customers: Customer[];
  customerId: string | null;
  onCustomerChange: (id: string | null) => void;
}

export function CustomerSidebar({
  customers,
  customerId,
  onCustomerChange,
}: CustomerSidebarProps) {
  const { data: fetchedCustomer } = useQuery({
    queryKey: ["customerDetail", customerId],
    queryFn: () => customerId ? customersApi.getById(customerId) : null,
    enabled: !!customerId,
  });

  const customer = (fetchedCustomer || customers.find((c) => c.id === customerId)) ?? null;
  const walletBalance = Math.max(0, Number(customer?.balance ?? 0));
  const dueBalance = Math.max(0, Number(customer?.due ?? 0));

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ["customer-history", customerId],
    queryFn: () => salesService.byCustomer(customerId!),
    enabled: !!customerId && customerId !== "walk-in",
  });

  return (
    <div className="bg-card rounded-[4px] border border-border flex flex-col h-full sticky top-4">
      {/* Header */}
      <div className="p-2 border-b border-border bg-secondary/15 rounded-t-[2px]">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Customer Info
        </h3>
        <CustomerSearch
          initialCustomers={customers}
          selectedCustomerId={customerId}
          onChange={(id) => onCustomerChange(id === "" ? null : id)}
        />
      </div>

      {/* Customer Details */}
      {customer && (
        <div className="p-2 space-y-3 flex-1">
          {/* Avatar & Basic Info */}
          <div className="flex items-start gap-2">
            <div className="h-8 w-8 rounded-[2px] bg-secondary/35 border border-border flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-slate-800 truncate">
                {customer.name}
              </h4>
              <p className="text-[9px] text-slate-500 truncate">
                {customer.group ? `Group: ${customer.group}` : "Retail Customer"}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {customer.phone && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-2 space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Outstanding Dues
            </h4>
            
            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-semibold text-slate-600">Total Due</span>
                <span className="text-[11px] font-bold text-orange-600 tabular-nums">
                  {formatCurrency(dueBalance)}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-semibold text-slate-600">Wallet / Advance</span>
                <span className="text-[11px] font-bold text-emerald-600 tabular-nums">
                  {formatCurrency(walletBalance)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-2">
             <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Recent Invoices
            </h4>
            
            {historyLoading ? (
              <div className="text-[10px] text-slate-400">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="text-[10px] text-slate-400">No previous sales found.</div>
            ) : (
              <ul className="space-y-1">
                {history.slice(0, 3).map((h: any) => (
                  <li key={h.id} className="flex justify-between items-center bg-secondary/15 border border-border rounded-[2px] p-1.5">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-700">{h.invoiceNo}</p>
                      <p className="text-[9px] text-slate-400">
                        {new Date(h.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit"
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                       <span className={`text-[9px] px-1 py-0.5 rounded-[2px] font-bold ${h.dueAmount > 0 ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}`}>
                        {h.dueAmount > 0 ? "Due" : "Paid"}
                      </span>
                      <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                        {formatCurrency(h.total)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {history.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mt-2 h-6 text-[10px] font-semibold bg-card border-border rounded-[2px]">
                    View All Invoices
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" side="right" className="w-80 p-0 overflow-hidden">
                  <div className="bg-muted px-3 py-2 border-b flex justify-between items-center">
                    <h4 className="text-sm font-semibold">Previous Sales</h4>
                    <span className="text-xs text-muted-foreground">{history.length} total</span>
                  </div>
                  <ul className="max-h-[300px] overflow-y-auto divide-y">
                    {history.map((h: any) => (
                      <li key={h.id} className="p-3 hover:bg-secondary/40 text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-slate-700">{h.invoiceNo}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(h.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {h.items?.reduce((s: any, i: any) => s + i.qty, 0) || 0} items
                          </span>
                          <span className="font-medium text-slate-800">
                            {formatCurrency(h.total)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      )}

      {!customer && (
        <div className="p-4 text-center text-slate-400 flex flex-col items-center justify-center flex-1">
          <User className="h-8 w-8 mb-1 opacity-20" />
          <p className="text-[11px] font-medium">No customer selected</p>
          <p className="text-[9px] mt-0.5">Select a customer to view details</p>
        </div>
      )}
    </div>
  );
}
