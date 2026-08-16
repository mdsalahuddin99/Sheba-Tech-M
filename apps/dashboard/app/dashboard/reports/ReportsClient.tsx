"use client";

import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useState } from "react";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { Download, BarChart3, Boxes, Receipt, Calculator, TrendingUp, TrendingDown, Layers, Box, Printer, Search, UserMinus, Scale, CreditCard, ArrowDownRight, ArrowUpRight, Percent, ClipboardList, AlertCircle, RefreshCw, Phone, PackageX } from "lucide-react";
import { toast } from "sonner";
import { useReportsMetricsQuery, useInventoryMetricsQuery, useDuesMetricsQuery, useExpensesDetailedQuery } from "@/features/reports/hooks";
import { cn } from "@/shared/lib/utils";
import { PageHeader } from "@/shared/components";
// We no longer import heavy client side aggregations! All calculation is safely managed backend.

const COLORS = ["#6366f1", "#8b5cf6", "#f59e0b", "#ec4899", "#10b981"];

function ChartTooltip({ active, payload, label, currency = true }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-xl shadow-xl px-4 py-3 text-xs">
      {label && <p className="text-slate-500 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold text-slate-800 text-sm">
          {currency ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsClient({
  initialMetrics,
  initialInventory,
  initialDues,
  initialExpensesDetailed,
  initialFromDate,
  initialToDate,
}: {
  initialMetrics?: any;
  initialInventory?: any;
  initialDues?: any;
  initialExpensesDetailed?: any;
  initialFromDate?: string;
  initialToDate?: string;
} = {}) {
  usePageTitle("Reports");

  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 29);
  
  const defaultFrom = initialFromDate || monthAgo.toISOString().slice(0, 10);
  const defaultTo = initialToDate || today;

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [method, setMethod] = useState<string>("All");

  const [activeTab, setActiveTab] = useState("pl");
  const [searchLowStock, setSearchLowStock] = useState("");
  const [searchOutOfStock, setSearchOutOfStock] = useState("");
  const [searchDeadStock, setSearchDeadStock] = useState("");
  const [searchExpense, setSearchExpense] = useState("");

  const isInitialDateRange = initialFromDate && initialToDate && from === initialFromDate && to === initialToDate && method === "All";

  const { data: metrics, isLoading: isMetricsLoading, isError: isMetricsError } = useReportsMetricsQuery(
    { from, to, paymentMethod: method },
    isInitialDateRange ? initialMetrics : undefined
  );
  
  const { data: inventory, isLoading: isInventoryLoading, isError: isInventoryError } = useInventoryMetricsQuery(
    { from, to },
    isInitialDateRange ? initialInventory : undefined
  );
  
  const { data: dues, isLoading: isDuesLoading, isError: isDuesError } = useDuesMetricsQuery(initialDues);
  
  const { data: expensesDetailed, isLoading: isExpensesDetailedLoading, isError: isExpensesDetailedError } = useExpensesDetailedQuery(
    { from, to },
    isInitialDateRange ? initialExpensesDetailed : undefined
  );

  const exportPL = () => {
    if (!metrics) return;
    const rows: (string | number)[][] = [
      ["Profit & Loss Report"],
      [`Date Range: ${from} to ${to}`],
      [""],
      ["Gross Profit", metrics.grossProfit],
      ["Net Profit", metrics.netProfit],
      ["Opening Stock", metrics.openingStock],
      [""],
      ["-- PURCHASES --"],
      ["Total Purchase", metrics.totalPurchase],
      ["Total Discount", metrics.totalDiscountPurchase],
      ["Paid Payment", metrics.paidPurchase],
      ["Purchase Due", metrics.duePurchase],
      [""],
      ["-- PURCHASE RETURNS --"],
      ["Total Purchase Return", metrics.totalPurchaseReturn],
      ["Total Discount", metrics.totalDiscountPurchaseReturn],
      ["Paid Payment", metrics.paidPurchaseReturn],
      ["Purchase Return Due", metrics.duePurchaseReturn],
      [""],
      ["-- EXPENSES --"],
      ["Total Expense", metrics.expenseTotal],
      [""],
      ["-- SALES --"],
      ["Total Sales", metrics.totalSales],
      ["Total Discount", metrics.totalDiscountSales + metrics.couponDiscount],
      ["Paid Payment", metrics.paidSales],
      ["Sales Due", metrics.dueSales],
      [""],
      ["-- SALES RETURNS --"],
      ["Return Total", metrics.returnTotal],
      ["Total Discount", metrics.totalDiscountSalesReturn + metrics.couponDiscountSalesReturn],
      ["Paid Payment", metrics.paidSalesReturn],
      ["Sales Return Due", metrics.dueSalesReturn],
      [""],
      ["-- EXPENSES BREAKDOWN --"],
      ["Category", "Amount"],
      ...metrics.expensesList.map((e) => [e.category, e.total])
    ];
    downloadCSV(`pl_report_${from}_to_${to}.csv`, rows);
    toast.success("P&L report downloaded!");
  };

  const exportSales = () => {
    if (!metrics) return;
    const rows: (string | number)[][] = [
      ["Sales Report"],
      [`Date Range: ${from} to ${to}`],
      [`Payment Method: ${method}`],
      [""],
      ["Total Revenue", metrics.totalRevenue],
      ["Total Transactions", metrics.txnCount],
      ["Average Order Value", metrics.aov],
      [""],
      ["-- ALL SALES ITEMS --"],
      ["Product Name", "Purchase Rate", "Sale Rate", "Discount", "Payable", "Paid", "Dues", "Date"],
      ...metrics.allSalesItems.map((p) => [p.name, p.cost, p.price, p.discount, p.payable, p.paid, p.due, formatDate(p.createdAt)])
    ];
    downloadCSV(`sales_report_${from}_to_${to}.csv`, rows);
    toast.success("Sales report downloaded!");
  };

  const exportLowStock = () => {
    if (!inventory) return;
    const rows: (string | number)[][] = [
      ["Low Stock Report"],
      ["Generated on", new Date().toLocaleDateString()],
      [""],
      ["Product Name", "Current Stock", "Reorder Level"],
      ...inventory.lowStock.map(p => [p.name, p.stock, p.minStock])
    ];
    downloadCSV(`low_stock_report.csv`, rows);
    toast.success("Low stock report downloaded!");
  };

  const exportOutOfStock = () => {
    if (!inventory) return;
    const rows: (string | number)[][] = [
      ["Out of Stock Report"],
      ["Generated on", new Date().toLocaleDateString()],
      [""],
      ["Product Name", "Current Stock"],
      ...inventory.lowStock.filter((p: any) => p.stock <= 0).map((p: any) => [p.name, p.stock])
    ];
    downloadCSV(`out_of_stock_report.csv`, rows);
    toast.success("Out of stock report downloaded!");
  };

  const exportDeadStock = () => {
    if (!inventory) return;
    const rows: (string | number)[][] = [
      ["Dead Stock Report"],
      [`Inactivity Range: ${from} to ${to}`],
      [""],
      ["Product Name", "Category", "Current Stock", "Value"],
      ...inventory.deadStock.map(p => [p.name, p.category, p.stock, p.value])
    ];
    downloadCSV(`dead_stock_report.csv`, rows);
    toast.success("Dead stock report downloaded!");
  };

  const exportDues = () => {
    if (!dues) return;
    const rows: (string | number)[][] = [
      ["Dues Report"],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [""],
      ["-- CUSTOMER RECEIVABLES --"],
      ["Customer Name", "Phone", "Due Amount"],
      ...dues.customers.map(c => [c.name, c.phone, c.due]),
      [""],
      ["Total Customer Due", dues.totalCustomerDue],
      [""],
      ["-- SUPPLIER PAYABLES --"],
      ["Supplier Name", "Phone", "Payable Amount"],
      ...dues.suppliers.map(s => [s.name, s.phone, s.payable]),
      [""],
      ["Total Supplier Payable", dues.totalSupplierPayable]
    ];
    downloadCSV(`dues_report.csv`, rows);
    toast.success("Dues report downloaded!");
  };

  const exportExpensesDetailed = () => {
    if (!expensesDetailed) return;
    const rows: (string | number)[][] = [
      ["Detailed Expenses Report"],
      [`Date Range: ${from} to ${to}`],
      [""],
      ["-- CATEGORY SUMMARY --"],
      ["Category", "Expenses Count", "Total Spent", "Percentage"],
      ...expensesDetailed.breakdown.map(b => [b.category, b.count, b.amount, `${b.percentage.toFixed(1)}%`]),
      [""],
      ["Total Expenses", expensesDetailed.totalExpense],
      [""],
      ["-- DETAILED EXPENSE LOG --"],
      ["Category", "Date", "Notes", "Amount"],
      ...expensesDetailed.expenses.map(e => [e.category, formatDate(e.date), e.notes, e.amount])
    ];
    downloadCSV(`expenses_detailed_report_${from}_to_${to}.csv`, rows);
    toast.success("Expenses detailed report downloaded!");
  };

  const hasError = isMetricsError || isInventoryError || isDuesError || isExpensesDetailedError;

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6 animate-in fade-in duration-300">
        <div className="relative max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-100/50 text-center space-y-6 overflow-hidden">
          {/* Radial red glow */}
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl bg-rose-500/10 -mr-10 -mt-10 -z-10" />
          
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-inner">
            <AlertCircle className="h-6 w-6 animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">রিপোর্ট লোড করতে সমস্যা হয়েছে</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না অথবা ডেটাবেজে কোনো জটিলতা দেখা দিয়েছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন অথবা আমাদের সাপোর্ট টিমের সাথে কথা বলুন।
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1 h-9 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-all"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin-slow" /> পেজ রিফ্রেশ করুন
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 h-9 text-xs font-semibold border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
              onClick={() => window.open("https://wa.me/8801724363229", "_blank")} // Real or dynamic whatsapp link if needed, or default
            >
              <Phone className="h-3.5 w-3.5 mr-2 text-slate-500" /> সাপোর্টে কথা বলুন
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isMetricsLoading || isInventoryLoading || isDuesLoading || isExpensesDetailedLoading || !metrics || !inventory || !dues || !expensesDetailed) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">রিপোর্ট লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const setPreset = (preset: "today" | "yesterday" | "thisWeek" | "thisMonth" | "allTime") => {
    const d = new Date();
    const todayStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (preset === "today") {
      setFrom(todayStr);
      setTo(todayStr);
    } else if (preset === "yesterday") {
      d.setDate(d.getDate() - 1);
      const yStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      setFrom(yStr);
      setTo(yStr);
    } else if (preset === "thisWeek") {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const firstDay = new Date(d.setDate(diff));
      setFrom(new Date(firstDay.getTime() - firstDay.getTimezoneOffset() * 60000).toISOString().slice(0, 10));
      setTo(todayStr);
    } else if (preset === "thisMonth") {
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      setFrom(new Date(firstDay.getTime() - firstDay.getTimezoneOffset() * 60000).toISOString().slice(0, 10));
      setTo(todayStr);
    } else if (preset === "allTime") {
      setFrom("2020-01-01");
      setTo(todayStr);
    }
  };

  const renderDateFilters = (showMethod = false, onExport: () => void, printLabel: string) => {
    const d = new Date();
    const todayStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    
    const yD = new Date();
    yD.setDate(yD.getDate() - 1);
    const yStr = new Date(yD.getTime() - yD.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    
    const wD = new Date();
    const day = wD.getDay();
    const diff = wD.getDate() - day + (day === 0 ? -6 : 1);
    const firstDayW = new Date(wD.setDate(diff));
    const thisWeekStr = new Date(firstDayW.getTime() - firstDayW.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    
    const mD = new Date();
    const firstDayM = new Date(mD.getFullYear(), mD.getMonth(), 1);
    const thisMonthStr = new Date(firstDayM.getTime() - firstDayM.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    let activePreset = null;
    if (from === todayStr && to === todayStr) activePreset = "today";
    else if (from === yStr && to === yStr) activePreset = "yesterday";
    else if (from === thisWeekStr && to === todayStr) activePreset = "thisWeek";
    else if (from === thisMonthStr && to === todayStr) activePreset = "thisMonth";
    else if (from === "2020-01-01" && to === todayStr) activePreset = "allTime";

    return (
    <div className="flex flex-col xl:flex-row justify-between items-center gap-3 mb-6 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm print:hidden">
      <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-2">Presets:</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {["today", "yesterday", "thisWeek", "thisMonth", "allTime"].map((preset) => {
            const labelMap = {
              today: "Today",
              yesterday: "Yesterday",
              thisWeek: "This Week",
              thisMonth: "This Month",
              allTime: "All Time",
            };
            const isActive = activePreset === preset;
            return (
              <Button
                key={preset}
                size="sm"
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "h-8 text-[11px] font-bold px-3.5 rounded-lg shadow-sm transition-all",
                  isActive 
                    ? "bg-slate-800 hover:bg-slate-900 text-white border-slate-800" 
                    : "text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 border-slate-200 shadow-sm"
                )}
                onClick={() => setPreset(preset as any)}
              >
                {labelMap[preset as keyof typeof labelMap]}
              </Button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm ml-1 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase">From</span>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-6 w-[110px] text-xs font-semibold bg-transparent border-none shadow-none focus-visible:ring-0 p-0 text-slate-700" />
          <span className="text-[10px] font-bold text-slate-400 uppercase pl-2 border-l border-slate-100">To</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-6 w-[110px] text-xs font-semibold bg-transparent border-none shadow-none focus-visible:ring-0 p-0 text-slate-700" />
        </div>
        {showMethod && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Method</span>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-[110px] h-6 text-xs bg-transparent border-none shadow-none p-0 focus:ring-0 font-semibold text-slate-700"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-200">
                <SelectItem value="All">All Tenders</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Mobile Banking">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2.5 w-full xl:w-auto xl:justify-end shrink-0">
        <Button size="sm" variant="outline" className="h-9 text-xs font-bold rounded-xl bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 transition-all shadow-sm" onClick={onExport}>
          <Download className="h-3.5 w-3.5 mr-2 text-slate-500" /> Export CSV
        </Button>
        <Button size="sm" className="h-9 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all" onClick={handlePrint}>
          <Printer className="h-3.5 w-3.5 mr-2" /> Print {printLabel}
        </Button>
      </div>
    </div>
  );
};

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20 print:p-0 print:m-0 print:space-y-4 printable-area">
      
      {/* ── Print Header (Hidden on Screen) ── */}
      <div className="hidden print:block text-center border-b-2 border-slate-800 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {activeTab === "pl" ? "P&L Report" 
           : activeTab === "sales" ? "Sales Report" 
           : activeTab === "inventory" ? "Inventory Report" 
           : activeTab === "dues" ? "Dues Report" 
           : "Expenses Report"}
        </h1>
        <p className="text-sm font-semibold text-slate-600 mt-1">Date Range: {from} to {to}</p>
      </div>

      <PageHeader 
        title="Business Performance Reports" 
        description="Track sales, profits, expenses, outstanding dues, and inventory value."
        className="print:hidden mb-6"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        
        {/* Top Section: Tabs & Stats in one row */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 print:hidden">
          
          <TabsList className="bg-transparent gap-2 w-full xl:w-auto justify-start h-auto p-0 flex-wrap">
            {[
              { 
                value: "pl", 
                label: "P&L", 
                icon: ClipboardList,
                activeClass: "data-[state=active]:bg-indigo-600 data-[state=active]:text-white border-transparent",
                hoverClass: "hover:bg-slate-50 border-slate-100",
                iconColor: "text-indigo-500 group-data-[state=active]:text-white"
              },
              { 
                value: "sales", 
                label: "Sales", 
                icon: Receipt,
                activeClass: "data-[state=active]:bg-indigo-600 data-[state=active]:text-white border-transparent",
                hoverClass: "hover:bg-slate-50 border-slate-100",
                iconColor: "text-emerald-500 group-data-[state=active]:text-white"
              },
              { 
                value: "inventory", 
                label: "Inventory", 
                icon: Boxes,
                activeClass: "data-[state=active]:bg-indigo-600 data-[state=active]:text-white border-transparent",
                hoverClass: "hover:bg-slate-50 border-slate-100",
                iconColor: "text-amber-500 group-data-[state=active]:text-white"
              },
              { 
                value: "dues", 
                label: "Dues", 
                icon: UserMinus,
                activeClass: "data-[state=active]:bg-indigo-600 data-[state=active]:text-white border-transparent",
                hoverClass: "hover:bg-slate-50 border-slate-100",
                iconColor: "text-violet-500 group-data-[state=active]:text-white"
              },
              { 
                value: "expenses", 
                label: "Expenses", 
                icon: CreditCard,
                activeClass: "data-[state=active]:bg-indigo-600 data-[state=active]:text-white border-transparent",
                hoverClass: "hover:bg-slate-50 border-slate-100",
                iconColor: "text-rose-500 group-data-[state=active]:text-white"
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "bg-white text-slate-700 border rounded-xl px-4 py-2 text-[13px] font-bold transition-all duration-200 flex items-center h-10 group",
                    tab.hoverClass,
                    tab.activeClass
                  )}
                >
                  <Icon className={cn("h-4 w-4 mr-2 transition-colors", tab.iconColor)} strokeWidth={2.5} /> {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar w-full xl:w-auto">
            {activeTab === "pl" && (
              <>
                <StatPill label="Total Sales" value={formatCurrency(metrics.totalSales)} icon={TrendingUp} color="indigo" />
                <StatPill label="Cost of Goods" value={formatCurrency(metrics.cogs)} icon={Layers} color="amber" />
                <StatPill label="Total Expenses" value={formatCurrency(metrics.expenseTotal)} icon={TrendingDown} color="rose" />
                <StatPill label="Gross Profit" value={formatCurrency(metrics.grossProfit)} icon={Calculator} color="emerald" />
                <StatPill label="Net Profit" value={formatCurrency(metrics.netProfit)} icon={TrendingUp} color="emerald" />
              </>
            )}
            {activeTab === "inventory" && (
              <>
                <StatPill label="Total Asset Value" value={formatCurrency(inventory.stockValue)} icon={Calculator} color="indigo" />
                <StatPill label="Low Stock Alerts" value={inventory.lowStock.filter(p => p.stock > 0).length.toString()} icon={TrendingDown} color="amber" />
                <StatPill label="Out of Stock" value={inventory.lowStock.filter(p => p.stock <= 0).length.toString()} icon={PackageX} color="rose" />
                <StatPill label="Dead Stock (90 Days)" value={inventory.deadStock.length.toString()} icon={Box} color="amber" />
              </>
            )}
            {activeTab === "sales" && (
              <>
                <StatPill label="Total Revenue" value={formatCurrency(metrics.totalRevenue)} icon={TrendingUp} color="indigo" />
                <StatPill label="Transactions" value={metrics.txnCount.toString()} icon={Receipt} color="violet" />
                <StatPill label="Products Sold" value={metrics.topProducts.reduce((sum: any, p: any) => sum + p.qty, 0).toString()} icon={Box} color="amber" />
                <StatPill label="Avg Order Value" value={formatCurrency(metrics.aov)} icon={Calculator} color="emerald" />
              </>
            )}
            {activeTab === "dues" && (
              <>
                <StatPill label="Total Customer Due" value={formatCurrency(dues.totalCustomerDue)} icon={ArrowDownRight} color="rose" />
                <StatPill label="Total Supplier Payable" value={formatCurrency(dues.totalSupplierPayable)} icon={ArrowUpRight} color="amber" />
              </>
            )}
            {activeTab === "expenses" && (
              <>
                <StatPill label="Total Expenses" value={formatCurrency(expensesDetailed.totalExpense)} icon={TrendingDown} color="rose" />
              </>
            )}
          </div>
        </div>

        {/* ── PROFIT & LOSS ── */}
        <TabsContent value="pl" className="space-y-4 mt-0 print:block">

          {renderDateFilters(false, exportPL, "P&L")}

          {/* Two-Column Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Left Column: Stock & Purchases */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50 overflow-hidden flex flex-col print:border-none print:shadow-none">
                <div className="px-4 py-2.5 border-b border-slate-100/50 flex items-center justify-between">
                  <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">Purchases & Stock Details</h3>
                  <div className="flex items-center gap-1.5 print:hidden">
                    <Button size="sm" variant="ghost" className="h-7 text-xs font-medium text-slate-600" onClick={exportPL}>
                      <Download className="h-3.5 w-3.5 mr-1" /> Export
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs font-medium text-slate-600" onClick={handlePrint}>
                      <Printer className="h-3.5 w-3.5 mr-1" /> Print
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] border-collapse">
                    <tbody>
                      <PLRow label="Opening Stock" value={formatCurrency(metrics.openingStock)} badgeVariant="info" />
                      
                      <PLRow label="Purchase" isHeading />
                      <PLRow label="Total Purchase" value={formatCurrency(metrics.totalPurchase)} />
                      <PLRow label="Total Discount" value={formatCurrency(metrics.totalDiscountPurchase)} />
                      <PLRow label="Paid Payment" value={formatCurrency(metrics.paidPurchase)} badgeVariant="success" />
                      <PLRow label="Purchase Due" value={formatCurrency(metrics.duePurchase)} badgeVariant="danger" />

                      <PLRow label="Purchase Return" isHeading />
                      <PLRow label="Total Purchase Return" value={formatCurrency(metrics.totalPurchaseReturn)} />
                      <PLRow label="Total Discount" value={formatCurrency(metrics.totalDiscountPurchaseReturn)} />
                      <PLRow label="Paid Payment" value={formatCurrency(metrics.paidPurchaseReturn)} badgeVariant="success" />
                      <PLRow label="Purchase Return Due" value={formatCurrency(metrics.duePurchaseReturn)} badgeVariant="danger" />
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Expenses & Sales */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50 overflow-hidden flex flex-col print:border-none print:shadow-none">
                <div className="px-4 py-2.5 border-b border-slate-100/50 flex items-center justify-between">
                  <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">Sales & Expenses Details</h3>
                  <div className="flex items-center gap-1.5 print:hidden">
                    <Button size="sm" variant="ghost" className="h-7 text-xs font-medium text-slate-600" onClick={exportPL}>
                      <Download className="h-3.5 w-3.5 mr-1" /> Export
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs font-medium text-slate-600" onClick={handlePrint}>
                      <Printer className="h-3.5 w-3.5 mr-1" /> Print
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] border-collapse">
                    <tbody>
                      <PLRow label="Total Expense" value={formatCurrency(metrics.expenseTotal)} badgeVariant="danger" />
                      
                      <PLRow label="SALES" isHeading />
                      <PLRow label="Gross Sales" value={formatCurrency(metrics.totalSales + metrics.totalDiscountSales + metrics.couponDiscount)} />
                      <PLRow label="Total Discount" value={formatCurrency(metrics.totalDiscountSales + metrics.couponDiscount)} badgeVariant="danger" />
                      <PLRow label="Net Sales" value={formatCurrency(metrics.totalSales)} badgeVariant="highlight" />
                      <PLRow label="Paid Payment" value={formatCurrency(metrics.paidSales)} badgeVariant="success" />
                      <PLRow label="Sales Due" value={formatCurrency(metrics.dueSales)} badgeVariant="danger" />

                      <PLRow label="SALES RETURN" isHeading />
                      <PLRow label="Return Total" value={formatCurrency(metrics.returnTotal)} badgeVariant="highlight" />
                      <PLRow label="Total Discount" value={formatCurrency(metrics.totalDiscountSalesReturn + metrics.couponDiscountSalesReturn)} />
                      <PLRow label="Paid Payment" value={formatCurrency(metrics.paidSalesReturn)} badgeVariant="success" />
                      <PLRow label="Sales Return Due" value={formatCurrency(metrics.dueSalesReturn)} badgeVariant="danger" />
                      
                      <PLRow label="CASH INFLOW" isHeading />
                      <PLRow label="Cash From New Sales" value={formatCurrency(metrics.paidSales)} />
                      <PLRow label="Due Collected" value={formatCurrency(metrics.dueCollected || 0)} badgeVariant="success" />
                      <PLRow label="Total Cash In" value={formatCurrency(metrics.paidSales + (metrics.dueCollected || 0))} badgeVariant="highlight" />
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>


        </TabsContent>

        {/* ── SALES ── */}
        <TabsContent value="sales" className="space-y-4 mt-0 print:block">
          {renderDateFilters(true, exportSales, "Sales")}

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50 overflow-hidden print:overflow-visible print:border-none print:shadow-none">
            <div className="px-4 py-3 border-b border-slate-100/50 flex items-center justify-between print:px-0">
              <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">All Sales</h3>
              <Button size="sm" variant="ghost" className="h-7 text-xs font-medium text-slate-600 print:hidden" onClick={exportSales}>
                <Download className="h-3.5 w-3.5 mr-1" /> CSV
              </Button>
            </div>
            <div className="overflow-auto max-h-[60vh] print:max-h-none print:overflow-visible relative">
              <table className="w-full text-[13px] border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-20 shadow-sm backdrop-blur-md">
                  <tr className="text-slate-500">
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Date & Time</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Product Name</th>
                    <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Purchase rate</th>
                    <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Sale rate</th>
                    <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Discount</th>
                    <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Payable</th>
                    <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Paid</th>
                    <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Dues</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.allSalesItems.map((p, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-1.5 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                      </td>
                      <td className="px-4 py-1.5 font-medium text-slate-700">{p.name}</td>
                      <td className="px-4 py-1.5 text-center text-slate-600 font-semibold">{formatCurrency(p.cost)}</td>
                      <td className="px-4 py-1.5 text-center text-slate-600 font-semibold">{formatCurrency(p.price)}</td>
                      <td className="px-4 py-1.5 text-center text-slate-600 font-semibold">{formatCurrency(p.discount)}</td>
                      <td className="px-4 py-1.5 text-center text-slate-600 font-semibold">{formatCurrency(p.payable)}</td>
                      <td className="px-4 py-1.5 text-center text-slate-600 font-semibold">{formatCurrency(p.paid)}</td>
                      <td className="px-4 py-1.5 text-right font-bold text-rose-600">{formatCurrency(p.due)}</td>
                    </tr>
                  ))}
                  {metrics.allSalesItems.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-6 text-slate-400 font-medium">No sales found in this range.</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-100/95 border-t-2 border-slate-200 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-md">
                  {(() => {
                    const totals = metrics.allSalesItems.reduce((acc, curr) => ({
                      cost: acc.cost + (curr.cost || 0),
                      price: acc.price + (curr.price || 0),
                      discount: acc.discount + (curr.discount || 0),
                      payable: acc.payable + (curr.payable || 0),
                      paid: acc.paid + (curr.paid || 0),
                      due: acc.due + (curr.due || 0),
                    }), { cost: 0, price: 0, discount: 0, payable: 0, paid: 0, due: 0 });
                    return (
                      <tr className="font-bold text-slate-800">
                        <td colSpan={2} className="px-4 py-3 text-left uppercase tracking-wider text-[11px]">Total</td>
                        <td className="px-4 py-3 text-center text-slate-700">{formatCurrency(totals.cost)}</td>
                        <td className="px-4 py-3 text-center text-slate-700">{formatCurrency(totals.price)}</td>
                        <td className="px-4 py-3 text-center text-slate-700">{formatCurrency(totals.discount)}</td>
                        <td className="px-4 py-3 text-center text-slate-700">{formatCurrency(totals.payable)}</td>
                        <td className="px-4 py-3 text-center text-emerald-700">{formatCurrency(totals.paid)}</td>
                        <td className="px-4 py-3 text-right text-rose-700">{formatCurrency(totals.due)}</td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── INVENTORY ── */}
        <TabsContent value="inventory" className="space-y-4 mt-0 print:block">
          
          <div className="flex items-center gap-2 mb-4 print:hidden">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Filter by Category:</span>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] h-8 text-[12px] bg-white border-slate-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="lcd">LCD</SelectItem>
                <SelectItem value="phones">Phones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Low Stock Queue */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:overflow-visible flex flex-col h-[500px] print:h-auto print:border-none print:shadow-none">
              <div className="px-4 py-3 bg-white print:bg-transparent print:px-0 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[12px] font-extrabold text-amber-700 print:text-slate-900 uppercase tracking-wide">Low Stock Queue</h3>
                  <div className="flex gap-1 print:hidden">
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-amber-700 hover:bg-amber-50" onClick={exportLowStock}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-amber-700 hover:bg-amber-50" onClick={handlePrint}>
                      <Printer className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 print:hidden">
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-500 uppercase px-1">From</span>
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-6 w-full text-[10px] bg-transparent border-none p-0 focus:ring-0 text-slate-700 font-medium" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase px-1 border-l border-slate-100">To</span>
                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-6 w-full text-[10px] bg-transparent border-none p-0 focus:ring-0 text-slate-700 font-medium" />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input 
                      placeholder="Search low stock..." 
                      value={searchLowStock}
                      onChange={(e) => setSearchLowStock(e.target.value)}
                      className="h-8 text-[11px] bg-white border-slate-200 pl-8 placeholder:text-slate-400 text-slate-900 font-medium rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto print:overflow-visible relative">
                <table className="w-full text-[12px]">
                  <thead className="bg-cyan-700 text-white sticky top-0 z-10 border-b border-cyan-800">
                    <tr>
                      <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Product</th>
                      <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.lowStock.filter((p: any) => p.stock > 0 && p.name.toLowerCase().includes(searchLowStock.toLowerCase())).length === 0 && (
                      <tr><td colSpan={2} className="text-center py-8 text-slate-400 font-medium">No items found.</td></tr>
                    )}
                    {inventory.lowStock
                      .filter((p: any) => p.stock > 0 && p.name.toLowerCase().includes(searchLowStock.toLowerCase()))
                      .map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2">
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <div className="text-[10px] font-medium text-slate-400">{p.category || p.minStock + ' min'}</div>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="text-amber-700 font-extrabold bg-amber-50 px-2.5 py-0.5 rounded-md text-[11px]">{p.stock}/{p.minStock}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Out of Stock Queue */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:overflow-visible flex flex-col h-[500px] print:h-auto print:border-none print:shadow-none">
              <div className="px-4 py-3 bg-white print:bg-transparent print:px-0 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[12px] font-extrabold text-rose-700 print:text-slate-900 uppercase tracking-wide">Out of Stock Queue</h3>
                  <div className="flex gap-1 print:hidden">
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-rose-700 hover:bg-rose-50" onClick={exportOutOfStock}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-rose-700 hover:bg-rose-50" onClick={handlePrint}>
                      <Printer className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 print:hidden">
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-500 uppercase px-1">From</span>
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-6 w-full text-[10px] bg-transparent border-none p-0 focus:ring-0 text-slate-700 font-medium" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase px-1 border-l border-slate-100">To</span>
                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-6 w-full text-[10px] bg-transparent border-none p-0 focus:ring-0 text-slate-700 font-medium" />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input 
                      placeholder="Search out of stock..." 
                      value={searchOutOfStock}
                      onChange={(e) => setSearchOutOfStock(e.target.value)}
                      className="h-8 text-[11px] bg-white border-slate-200 pl-8 placeholder:text-slate-400 text-slate-900 font-medium rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto print:overflow-visible relative">
                <table className="w-full text-[12px]">
                  <thead className="bg-cyan-700 text-white sticky top-0 z-10 border-b border-cyan-800">
                    <tr>
                      <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Product</th>
                      <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.lowStock.filter((p: any) => p.stock <= 0 && p.name.toLowerCase().includes(searchOutOfStock.toLowerCase())).length === 0 && (
                      <tr><td colSpan={2} className="text-center py-8 text-slate-400 font-medium">No items found.</td></tr>
                    )}
                    {inventory.lowStock
                      .filter((p: any) => p.stock <= 0 && p.name.toLowerCase().includes(searchOutOfStock.toLowerCase()))
                      .map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2">
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <div className="text-[10px] font-medium text-slate-400">{p.category || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="text-rose-700 font-extrabold bg-rose-50 px-2.5 py-0.5 rounded-md text-[11px]">0</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dead Stock */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:overflow-visible flex flex-col h-[500px] print:h-auto print:border-none print:shadow-none">
              <div className="px-4 py-3 bg-white print:bg-transparent print:px-0 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[12px] font-extrabold text-rose-700 print:text-slate-900 uppercase tracking-wide">Dead Stock Value</h3>
                  <div className="flex gap-1 print:hidden">
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-rose-700 hover:bg-rose-50" onClick={exportDeadStock}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-rose-700 hover:bg-rose-50" onClick={handlePrint}>
                      <Printer className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 print:hidden">
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-500 uppercase px-1">From</span>
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-6 w-full text-[10px] bg-transparent border-none p-0 focus:ring-0 text-slate-700 font-medium" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase px-1 border-l border-slate-100">To</span>
                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-6 w-full text-[10px] bg-transparent border-none p-0 focus:ring-0 text-slate-700 font-medium" />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input 
                      placeholder="Search dead stock..." 
                      value={searchDeadStock}
                      onChange={(e) => setSearchDeadStock(e.target.value)}
                      className="h-8 text-[11px] bg-white border-slate-200 pl-8 placeholder:text-slate-400 text-slate-900 font-medium rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto print:overflow-visible relative">
                <table className="w-full text-[12px]">
                  <thead className="bg-cyan-700 text-white sticky top-0 z-10 border-b border-cyan-800">
                    <tr>
                      <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Product</th>
                      <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Stock</th>
                      <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.deadStock.filter((p: any) => p.name.toLowerCase().includes(searchDeadStock.toLowerCase()) || p.category.toLowerCase().includes(searchDeadStock.toLowerCase())).length === 0 && (
                      <tr><td colSpan={3} className="text-center py-8 text-slate-400 font-medium">No items found.</td></tr>
                    )}
                    {inventory.deadStock
                      .filter((p: any) => p.name.toLowerCase().includes(searchDeadStock.toLowerCase()) || p.category.toLowerCase().includes(searchDeadStock.toLowerCase()))
                      .map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2">
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <div className="text-[10px] font-medium text-slate-400">{p.category}</div>
                        </td>
                        <td className="px-4 py-2 text-center text-rose-700 font-extrabold">{p.stock}</td>
                        <td className="px-4 py-2 text-right font-extrabold text-slate-700">{formatCurrency(p.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
         </TabsContent>

        {/* ── DUES REPORT ── */}
        <TabsContent value="dues" className="space-y-4 mt-0 print:block">
          {/* Summary title and export */}
          <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200/70 shadow-sm print:hidden">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Scale className="h-4 w-4 text-indigo-600" /> Outstanding Receivables & Payables
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs font-medium" onClick={exportDues}>
                <Download className="h-3.5 w-3.5 mr-2" /> Export Dues
              </Button>
              <Button size="sm" className="h-8 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white" onClick={handlePrint}>
                <Printer className="h-3.5 w-3.5 mr-2" /> Print Dues
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Customer Dues */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50 overflow-hidden flex flex-col print:border-none print:shadow-none">
              <div className="px-4 py-2.5 border-b border-slate-100/50 flex items-center justify-between">
                <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">Customer Receivables (বকেয়া)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="text-left px-4 py-2">Customer Name</th>
                      <th className="text-center px-4 py-2">Phone</th>
                      <th className="text-right px-4 py-2">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dues.customers.map((c) => (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-2 font-medium text-slate-700">{c.name}</td>
                        <td className="px-4 py-2 text-center text-slate-500 font-semibold">{c.phone}</td>
                        <td className="px-4 py-2 text-right">
                          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200/80 font-bold text-[11px] px-2 py-0.5 shadow-none rounded-md">
                            {formatCurrency(c.due)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {dues.customers.length === 0 && (
                      <tr><td colSpan={3} className="text-center py-6 text-slate-400 font-medium">No customer dues outstanding.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Supplier Dues */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50 overflow-hidden flex flex-col print:border-none print:shadow-none">
              <div className="px-4 py-2.5 border-b border-slate-100/50 flex items-center justify-between">
                <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">Supplier Payables (দেনাদারি)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="text-left px-4 py-2">Supplier Name</th>
                      <th className="text-center px-4 py-2">Phone</th>
                      <th className="text-right px-4 py-2">Payable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dues.suppliers.map((s) => (
                      <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-2 font-medium text-slate-700">{s.name}</td>
                        <td className="px-4 py-2 text-center text-slate-500 font-semibold">{s.phone}</td>
                        <td className="px-4 py-2 text-right">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200/80 font-bold text-[11px] px-2 py-0.5 shadow-none rounded-md">
                            {formatCurrency(s.payable)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {dues.suppliers.length === 0 && (
                      <tr><td colSpan={3} className="text-center py-6 text-slate-400 font-medium">No supplier payables outstanding.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── EXPENSES REPORT ── */}
        <TabsContent value="expenses" className="space-y-4 mt-0 print:block">
            {renderDateFilters(false, exportExpensesDetailed, "Expenses")}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: Category Summary breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50 overflow-hidden flex flex-col h-fit print:border-none print:shadow-none">
                <div className="px-4 py-2.5 border-b border-slate-100/50 flex items-center justify-between">
                  <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">Category Summary</h3>
                </div>
                <div className="p-4 space-y-4">
                  {expensesDetailed.breakdown.map((b) => (
                    <div key={b.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{b.category}</Badge>
                          <span className="text-[10px] font-normal text-slate-400">({b.count})</span>
                        </span>
                        <span>{formatCurrency(b.amount)} ({b.percentage.toFixed(1)}%)</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${b.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                  {expensesDetailed.breakdown.length === 0 && (
                    <p className="text-center py-6 text-slate-400 font-medium text-xs">No expense breakdown available.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Detailed Log */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50 overflow-hidden flex flex-col print:border-none print:shadow-none">
                <div className="px-4 py-2.5 border-b border-slate-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">Expense Log (খরচের খাতা)</h3>
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-[220px] print:hidden">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search expenses..."
                      value={searchExpense}
                      onChange={(e) => setSearchExpense(e.target.value)}
                      className="pl-8 h-7 text-xs bg-slate-50 border-slate-200 focus-visible:bg-white"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="text-left px-4 py-2">Category</th>
                        <th className="text-left px-4 py-2">Date</th>
                        <th className="text-left px-4 py-2">Notes</th>
                        <th className="text-right px-4 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expensesDetailed.expenses
                        .filter((e) => 
                          (e.category || "").toLowerCase().includes(searchExpense.toLowerCase()) ||
                          (e.notes || "").toLowerCase().includes(searchExpense.toLowerCase())
                        )
                        .map((e) => (
                          <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                            <td className="px-4 py-2 font-medium">
                              <Badge variant="outline" className="font-bold text-[9.5px] uppercase tracking-wider text-slate-600 bg-slate-50">{e.category}</Badge>
                            </td>
                            <td className="px-4 py-2 text-slate-500 font-semibold">{formatDate(e.date)}</td>
                            <td className="px-4 py-2 text-slate-600 max-w-[200px] truncate" title={e.notes}>{e.notes || "—"}</td>
                            <td className="px-4 py-2 text-right font-bold text-rose-700">{formatCurrency(e.amount)}</td>
                          </tr>
                        ))}
                      {expensesDetailed.expenses.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-6 text-slate-400 font-medium">No expenses logged.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}

function StatPill({ label, value, icon: Icon, color = "indigo" }: { label: string; value: string; icon: any; color?: "indigo" | "emerald" | "rose" | "amber" | "violet" }) {
  const scheme = {
    indigo: "bg-indigo-50/80 text-indigo-700",
    emerald: "bg-emerald-50/80 text-emerald-700",
    rose: "bg-rose-50/80 text-rose-700",
    amber: "bg-amber-50/80 text-amber-700",
    violet: "bg-violet-50/80 text-violet-700",
  }[color];

  const iconColor = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    amber: "text-amber-400",
    violet: "text-violet-400",
  }[color];

  return (
    <div className={cn("flex flex-col justify-center px-4 py-1.5 rounded-xl border border-transparent min-w-[130px]", scheme)}>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className={cn("h-3 w-3", iconColor)} strokeWidth={3} />
        <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <span className="text-[13px] font-extrabold tracking-tight tabular-nums">{value}</span>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color = "indigo" }: { label: string; value: string; icon: any; color?: "indigo" | "emerald" | "rose" | "amber" | "violet" }) {
  const colorMap = {
    indigo: {
      border: "border-l-indigo-600 focus-within:border-l-indigo-600",
      iconBg: "bg-indigo-50 text-indigo-600",
      accent: "from-indigo-50/50 to-transparent",
    },
    emerald: {
      border: "border-l-emerald-600 focus-within:border-l-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-600",
      accent: "from-emerald-50/50 to-transparent",
    },
    rose: {
      border: "border-l-rose-600 focus-within:border-l-rose-600",
      iconBg: "bg-rose-50 text-rose-700",
      accent: "from-rose-50/50 to-transparent",
    },
    amber: {
      border: "border-l-amber-600 focus-within:border-l-amber-600",
      iconBg: "bg-amber-50 text-amber-700",
      accent: "from-amber-50/50 to-transparent",
    },
    violet: {
      border: "border-l-violet-600 focus-within:border-l-violet-600",
      iconBg: "bg-violet-50 text-violet-600",
      accent: "from-violet-50/50 to-transparent",
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-white p-3 border border-slate-200/80 border-l-[4px] transition-all duration-300 hover:shadow-md hover:shadow-slate-100/80 hover:-translate-y-0.5 flex flex-col justify-between min-h-[80px]",
      scheme.border
    )}>
      {/* Background radial highlight */}
      <div className={cn("absolute right-0 top-0 w-16 h-16 rounded-full blur-xl bg-gradient-to-br -z-10 opacity-70", scheme.accent)} />
      
      <div className="flex items-center justify-between mb-1">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={cn("p-1.5 rounded-lg transition-colors duration-300", scheme.iconBg)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      
      <div className="mt-1">
        <p className="text-lg font-extrabold tracking-tight text-slate-800 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function PLRow({ 
  label, 
  value = "", 
  valueClass = "text-slate-800", 
  isHeading = false, 
  bgClass = "",
  badgeVariant
}: { 
  label: string; 
  value?: string | number; 
  valueClass?: string; 
  isHeading?: boolean; 
  bgClass?: string;
  badgeVariant?: "success" | "danger" | "info" | "neutral" | "highlight";
}) {
  if (isHeading) {
    return (
      <tr className="border-b border-slate-100">
        <td colSpan={2} className="px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full" />
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">{label}</span>
          </div>
        </td>
      </tr>
    );
  }

  let valueNode = <span className={cn("font-bold text-[13px] tabular-nums", valueClass)}>{value}</span>;

  if (badgeVariant === "success") {
    valueNode = (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200/60 font-bold text-[12px] px-2.5 py-1 shadow-none rounded-md">
        {value}
      </Badge>
    );
  } else if (badgeVariant === "danger") {
    valueNode = (
      <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200/60 font-bold text-[12px] px-2.5 py-1 shadow-none rounded-md">
        {value}
      </Badge>
    );
  } else if (badgeVariant === "info") {
    valueNode = (
      <Badge variant="outline" className="bg-sky-50 text-sky-600 border-sky-200/60 font-bold text-[12px] px-2.5 py-1 shadow-none rounded-md">
        {value}
      </Badge>
    );
  } else if (badgeVariant === "highlight") {
    valueNode = (
      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-bold text-[12px] px-2.5 py-1 shadow-none rounded-md">
        {value}
      </Badge>
    );
  }

  return (
    <tr className={cn("border-b border-slate-100/50 last:border-0 hover:bg-slate-50/50 transition-colors", bgClass)}>
      <td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">{label}</td>
      <td className="px-5 py-3.5 text-right">{valueNode}</td>
    </tr>
  );
}
