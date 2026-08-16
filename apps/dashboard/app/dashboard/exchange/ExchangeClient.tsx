"use client";

import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/ui/table";
import { formatCurrency, formatDateTime } from "@/shared/lib/format";
import { Search, ArrowLeftRight, Clock, FileText, History } from "lucide-react";
import { Sale } from "@/shared/lib/types";
import { PageHeader, EmptyState } from "@/shared/components";
import { useInfiniteSalesQuery } from "@/features/sales/hooks";

export function ExchangeClient() {
  usePageTitle("Exchange");
  const router = useRouter();
  
  // --- New Exchange Search State ---
  const [newSearch, setNewSearch] = useState("");
  const [debouncedNewSearch, setDebouncedNewSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedNewSearch(newSearch), 500);
    return () => clearTimeout(timer);
  }, [newSearch]);

  const isNewSearching = debouncedNewSearch.trim().length > 0;

  const newSearchFilter = useMemo(() => ({
    search: isNewSearching ? debouncedNewSearch.trim() : undefined,
    limit: 10,
  }), [isNewSearching, debouncedNewSearch]);

  const { data: newSearchData, isLoading: isNewLoading } = useInfiniteSalesQuery(newSearchFilter);

  const newSearchSales = useMemo(() => {
    if (!isNewSearching) return [];
    return newSearchData?.pages.flatMap((p: any) => p.items) || [];
  }, [newSearchData, isNewSearching]);

  // --- Exchange History State ---
  const [historySearch, setHistorySearch] = useState("");
  const [debouncedHistorySearch, setDebouncedHistorySearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedHistorySearch(historySearch), 500);
    return () => clearTimeout(timer);
  }, [historySearch]);

  const historyFilter = useMemo(() => ({
    status: "EXCHANGED",
    search: debouncedHistorySearch.trim() || undefined,
    limit: 20,
  }), [debouncedHistorySearch]);

  const { data: historyData, isLoading: isHistoryLoading } = useInfiniteSalesQuery(historyFilter);

  const historySales = useMemo(() => {
    return historyData?.pages.flatMap((p: any) => p.items) || [];
  }, [historyData]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <PageHeader 
        title="Exchange" 
        description="Search for an invoice or product to initiate an exchange, or view exchange history."
      />

      {/* Initiate New Exchange Section */}
      <Card className="p-4 sm:p-6 shadow-sm border-border">
        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
          <ArrowLeftRight className="w-5 h-5 mr-2 text-primary" />
          Initiate New Exchange
        </h3>
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            autoFocus
            type="text"
            placeholder="Scan or Search by Invoice No, Phone, or Product Serial..."
            className="pl-11 h-14 text-base sm:text-lg bg-secondary/30 rounded-xl border-2 border-transparent focus:border-primary transition-colors placeholder:text-muted-foreground/60"
            value={newSearch}
            onChange={(e) => setNewSearch(e.target.value)}
          />
        </div>

        {isNewSearching && (
          <div className="mt-4 border rounded-xl overflow-hidden bg-white shadow-sm">
            {isNewLoading ? (
               <div className="p-6 text-sm text-muted-foreground text-center">Searching...</div>
            ) : newSearchSales.length === 0 ? (
               <div className="p-6 text-sm text-muted-foreground text-center">No matching invoices found.</div>
            ) : (
               <div className="overflow-x-auto">
                 <Table>
                   <TableHeader>
                     <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                       <TableHead className="w-[120px] font-semibold text-xs text-slate-500 uppercase tracking-wider">Invoice No</TableHead>
                       <TableHead className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Date</TableHead>
                       <TableHead className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Customer</TableHead>
                       <TableHead className="text-right font-semibold text-xs text-slate-500 uppercase tracking-wider">Total</TableHead>
                       <TableHead className="w-[120px] text-center font-semibold text-xs text-slate-500 uppercase tracking-wider">Action</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {newSearchSales.map((sale: Sale) => (
                       <TableRow key={sale.id} className="group hover:bg-slate-50 transition-colors">
                         <TableCell className="font-mono text-sm font-semibold text-slate-700">#{sale.invoiceNo}</TableCell>
                         <TableCell>
                           <div className="flex items-center text-xs text-slate-500">
                             <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                             {formatDateTime(sale.date)}
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="text-sm font-medium text-slate-900">{sale.customerName || "Walk-in Customer"}</div>
                           {sale.customerPhone && <div className="text-xs text-slate-500">{sale.customerPhone}</div>}
                         </TableCell>
                         <TableCell className="text-right font-bold text-sm text-slate-800">{formatCurrency(sale.total)}</TableCell>
                         <TableCell className="text-center">
                           <Button
                             size="sm"
                             className="h-8 font-semibold w-full bg-primary text-primary-foreground hover:bg-primary/90"
                             onClick={() => router.push(`/dashboard/sales/create?exchangeSaleId=${sale.id}`)}
                           >
                             <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
                             Exchange
                           </Button>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>
            )}
          </div>
        )}
      </Card>

      {/* Exchange History Section */}
      <Card className="shadow-sm border-border overflow-hidden">
        <div className="p-4 bg-muted/40 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-sm text-slate-700 flex items-center">
            <History className="w-4 h-4 mr-1.5 text-slate-500" />
            Exchange History
          </h3>
          <div className="flex items-center gap-3">
             <div className="relative w-full sm:w-64">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder="Search history..."
                 className="pl-9 h-9 text-sm"
                 value={historySearch}
                 onChange={(e) => setHistorySearch(e.target.value)}
               />
             </div>
             <Badge variant="outline" className="text-[10px] font-mono bg-white h-9 flex items-center whitespace-nowrap">
               {isHistoryLoading ? "Loading..." : `${historySales.length} records`}
             </Badge>
          </div>
        </div>

        {historySales.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No exchanges found"
            description={
              debouncedHistorySearch 
                ? "Try searching by a different term."
                : "When you complete an exchange in the POS, it will appear here."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[120px] font-semibold text-xs text-slate-500 uppercase tracking-wider">Invoice No</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Date</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-500 uppercase tracking-wider">Total</TableHead>
                  <TableHead className="w-[100px] text-center font-semibold text-xs text-slate-500 uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historySales.map((sale: Sale) => (
                  <TableRow key={sale.id} className="group hover:bg-slate-50 transition-colors">
                    <TableCell className="font-mono text-sm font-semibold text-slate-700">
                      #{sale.invoiceNo}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                        {formatDateTime(sale.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-900">
                        {sale.customerName || "Walk-in Customer"}
                      </div>
                      {sale.customerPhone && (
                        <div className="text-xs text-slate-500">{sale.customerPhone}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-sm text-slate-800">
                      {formatCurrency(sale.total)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 font-semibold w-full text-slate-600"
                        onClick={() => router.push(`/dashboard/sales/${sale.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
