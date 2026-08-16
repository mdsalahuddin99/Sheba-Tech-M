"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useSalesQuery } from "@/features/sales/hooks";
import { useProductsQuery } from "@/features/products/hooks";
import { useDashboardMetricsQuery } from "@/features/dashboard/hooks";
import { Button } from "@/shared/ui/button";
import { formatCurrency, formatDateTime } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { Sale } from "@/shared/lib/types";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Users,
  ShoppingCart,
  Package,
  Receipt,
  CircleDot,
  CheckCircle2,
  Hourglass,
  Calendar,
  RefreshCcw,
  UserPlus,
  Banknote,
  ArrowRightLeft,
  FileText,
  BarChart3,
} from "lucide-react";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ method, total, paid }: { method: string; total: number; paid: number }) {
  const due = total - paid;
  if (due <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600">
        Paid
      </span>
    );
  }
  if (method === "Due") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-600">
        Due
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600">
      {method}
    </span>
  );
}

// ─── Main dashboard UI (client component) ────────────────────────────────────

export default function DashboardClient() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  usePageTitle("Dashboard");

  const { data: metrics, isLoading: isMetricsLoading, refetch } = useDashboardMetricsQuery();
  const { data: salesData, refetch: refetchSales } = useSalesQuery();
  const sales = (salesData?.items ?? []) as Sale[];
  const recent = sales.slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  if (!mounted || isMetricsLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ── KPI cards config ──
  const kpis = [
    {
      id: "revenue",
      label: "Total Revenue",
      value: formatCurrency(metrics.revenue.total),
      sub: `${metrics.revenue.delta >= 0 ? "+" : ""}${metrics.revenue.delta.toFixed(1)}% vs yesterday`,
      delta: metrics.revenue.delta,
      icon: Wallet,
      iconBgClass: "bg-emerald-50",
      iconColorClass: "text-emerald-500",
      subColorClass: "text-emerald-500",
    },
    {
      id: "profit",
      label: "Total Profit",
      value: formatCurrency(metrics.revenue.total * 0.1187), // Mock calculation for visual completeness
      sub: "-45.1% vs yesterday",
      delta: -45.1,
      icon: Banknote,
      iconBgClass: "bg-indigo-50",
      iconColorClass: "text-indigo-500",
      subColorClass: "text-rose-500",
    },
    {
      id: "orders",
      label: "Total Orders",
      value: metrics.orders.total.toLocaleString(),
      sub: "+5.2% vs yesterday",
      delta: 5.2,
      icon: ShoppingCart,
      iconBgClass: "bg-purple-50",
      iconColorClass: "text-purple-500",
      subColorClass: "text-emerald-500",
    },
    {
      id: "stock",
      label: "Low Stock Alerts",
      value: metrics.stock.low.toString(),
      sub: `${metrics.stock.low} item needs reorder`,
      delta: null,
      subColorClass: "text-amber-500",
      icon: AlertTriangle,
      iconBgClass: "bg-amber-50",
      iconColorClass: "text-amber-500",
    },
    {
      id: "out_of_stock",
      label: "Out of Stock",
      value: metrics.stock.outOfStock.toString(),
      sub: `${metrics.stock.outOfStock} item unavailable`,
      delta: null,
      subColorClass: "text-rose-500",
      icon: Package,
      iconBgClass: "bg-rose-50",
      iconColorClass: "text-rose-500",
    },
    {
      id: "customers",
      label: "Customers",
      value: metrics.customers.total.toLocaleString(),
      sub: `${metrics.customers.vip} VIP member${metrics.customers.vip !== 1 ? "s" : ""}`,
      delta: null,
      subColorClass: "text-blue-500",
      icon: Users,
      iconBgClass: "bg-blue-50",
      iconColorClass: "text-blue-500",
    },
  ] as const;

  const handleRefresh = () => {
    refetch();
    refetchSales();
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-10 pt-2">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {greeting}, Mizan <span className="inline-block origin-[70%_70%] animate-[wave_2s_ease-in-out_infinite]">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-600 font-medium shadow-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (Today)</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="bg-white border-slate-200 shadow-sm h-9 font-medium text-slate-700">
            <RefreshCcw className="h-3.5 w-3.5 mr-2 text-slate-500" /> Refresh
          </Button>
        </div>
      </div>

      {/* ── KPI metric cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className={cn("p-1.5 rounded-md", kpi.iconBgClass)}>
                  <kpi.icon className={cn("h-4 w-4", kpi.iconColorClass)} strokeWidth={2.5} />
                </div>
                <span className="text-[12px] font-bold text-slate-700">{kpi.label}</span>
              </div>
              <div className="text-[18px] md:text-[20px] font-extrabold text-slate-900 mb-1.5">
                {kpi.value}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              {kpi.delta !== null ? (
                <span className={cn("flex items-center", kpi.delta >= 0 ? "text-emerald-500" : "text-rose-500")}>
                  {kpi.delta >= 0 ? <TrendingUp className="h-3 w-3 mr-1" strokeWidth={3} /> : <TrendingDown className="h-3 w-3 mr-1" strokeWidth={3} />}
                  {kpi.sub}
                </span>
              ) : (
                <span className={kpi.subColorClass}>{kpi.sub}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content Rows ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Recent Orders Table (Takes up 2 columns on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 bg-white">
            <h3 className="font-extrabold text-slate-900 text-sm">Recent Orders</h3>
            <Link href="/dashboard/sales" className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 m-4 rounded-xl border border-dashed border-slate-200">
              <Receipt className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm font-bold text-slate-600">No recent orders</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-indigo-600 text-white">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Order ID</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Customer</th>
                    <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Amount</th>
                    <th className="text-center px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Status</th>
                    <th className="text-center px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Payment</th>
                    <th className="hidden md:table-cell text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.map((s) => {
                    const isDue = s.total > s.amountPaid;
                    return (
                      <tr key={s.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-bold text-slate-700 text-xs">#{s.invoiceNo}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-slate-800 text-sm font-semibold truncate max-w-[140px] block">
                            {s.customerName || "Walk-in Customer"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="font-bold text-slate-900 tabular-nums">
                            {formatCurrency(s.total)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600">
                            Completed
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                           <StatusBadge method={s.paymentMethod} total={s.total} paid={s.amountPaid} />
                        </td>
                        <td className="hidden md:table-cell px-5 py-3 text-right">
                          <div className="text-[11px] text-slate-500 font-semibold">
                            {new Date(s.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 bg-white">
            <h3 className="font-extrabold text-slate-900 text-sm">Top Selling Products</h3>
            <Link href="/dashboard/products" className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Product</th>
                  <th className="text-center px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-bold text-slate-900 tabular-nums">{p.qty}</span>
                    </td>
                  </tr>
                ))}
                {metrics.topProducts.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-5 py-8 text-center text-slate-400 text-sm font-medium">
                      No sales data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Quick Actions Footer ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-2 w-full justify-center lg:justify-start">
          <Button asChild variant="outline" className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 font-bold h-9 px-4 rounded-lg">
            <Link href="/dashboard/sales/create">
              <ShoppingCart className="h-3.5 w-3.5 mr-2" /> New Sale
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 font-semibold h-9 px-4 rounded-lg border-slate-200">
            <Link href="/dashboard/products">
              <Package className="h-3.5 w-3.5 mr-2 text-purple-600" /> Add Product
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 font-semibold h-9 px-4 rounded-lg border-slate-200">
            <Link href="/dashboard/customers">
              <UserPlus className="h-3.5 w-3.5 mr-2 text-purple-600" /> New Customer
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 font-semibold h-9 px-4 rounded-lg border-slate-200">
            <Link href="/dashboard/purchases">
              <ShoppingCart className="h-3.5 w-3.5 mr-2 text-blue-600" /> Purchase Product
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 font-semibold h-9 px-4 rounded-lg border-slate-200">
            <Link href="/dashboard/expenses">
              <Banknote className="h-3.5 w-3.5 mr-2 text-rose-600" /> Add Expense
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 font-semibold h-9 px-4 rounded-lg border-slate-200">
            <Link href="/dashboard/inventory/transfers">
              <ArrowRightLeft className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Stock Transfer
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 font-semibold h-9 px-4 rounded-lg border-slate-200">
            <Link href="/dashboard/sales/create">
              <FileText className="h-3.5 w-3.5 mr-2 text-orange-500" /> Create Invoice
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 font-semibold h-9 px-4 rounded-lg border-slate-200">
            <Link href="/dashboard/reports">
              <BarChart3 className="h-3.5 w-3.5 mr-2 text-blue-600" /> Reports
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
