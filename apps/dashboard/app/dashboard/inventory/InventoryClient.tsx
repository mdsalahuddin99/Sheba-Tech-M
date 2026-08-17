"use client";

import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { LoadingButton } from "@/shared/ui/loading-button";
import { Badge } from "@/shared/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/shared/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/shared/ui/dropdown-menu";
import { formatCurrency, formatDateTime } from "@/shared/lib/format";
import { Search, Plus, History, Pencil, Trash2, PackagePlus, Tag, Check, X, ScanLine, Printer, ChevronRight, CornerDownRight, Boxes, Layers, Info, Download, Share2 } from "lucide-react";
import { Switch } from "@/shared/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import { AdjustmentType, Product, Category, ProductCondition, StockAdjustment } from "@/shared/lib/types";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import CameraScanner from "@/components/CameraScanner";
import { PageHeader } from "@/shared/components";
import { AutoSuggest } from "@/shared/ui/auto-suggest";
import { useAdjustments, useInventoryActions } from "@/features/inventory/hooks";
import { useInventoryMetricsQuery } from "@/features/reports/hooks";
import {
  useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
} from "@/features/products/hooks";
import { useWarehouses } from "@/features/warehouses/hooks";
import type { CategoryItem } from "@/shared/api-client/categories";
import { listCategories, createCategory, updateCategory as updateCategoryApi, removeCategory as removeCategoryApi } from "@/shared/api-client/categories";
import { effectiveReorderPoint } from "@/features/products/bundle";
import {
  InventoryProductTable,
  InventoryProductMobileList,
  AdjustmentsHistory,
} from "@/features/inventory/components";
import { LabelPrintDialog } from "@/features/labels";
import { ProductFormDialog } from "@/features/products/ProductFormDialog";
import { useReactToPrint } from "react-to-print";
import { toJpeg } from "html-to-image";

export function InventoryClient({
  initialProducts,
  initialAdjustments,
  initialCategories,
  filterOnlineOnly = false,
}: {
  initialProducts: Product[];
  initialAdjustments: StockAdjustment[];
  initialCategories: CategoryItem[];
  filterOnlineOnly?: boolean;
}) {
  usePageTitle("Inventory");
  const { data: rawProducts = [] } = useProducts(initialProducts);
  const products = useMemo(() => {
    return filterOnlineOnly ? rawProducts.filter(p => p.isPublished) : rawProducts;
  }, [rawProducts, filterOnlineOnly]);
  const adjustments = useAdjustments(initialAdjustments);
  const { adjust } = useInventoryActions();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "flat"],
    queryFn: () => listCategories(true) as Promise<CategoryItem[]>,
    initialData: initialCategories,
  });
  
  const { data: inventoryMetrics } = useInventoryMetricsQuery({ onlineOnly: filterOnlineOnly });
  const stockValue = inventoryMetrics?.stockValue ?? 0;
  const lowCount = inventoryMetrics?.lowStock.length ?? 0;
  const warehouses = useWarehouses();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("all");

  const warehouseProducts = useMemo(() => {
    if (!selectedWarehouseId || selectedWarehouseId === "all") return products;
    return products
      .filter(p => p.warehouseStocks?.some((w: any) => w.warehouseId === selectedWarehouseId))
      .map(p => {
        const wStock = p.warehouseStocks?.find((w: any) => w.warehouseId === selectedWarehouseId);
        return {
          ...p,
          stock: wStock ? Number(wStock.qty) : 0,
        };
      });
  }, [products, selectedWarehouseId]);

  const outCount = warehouseProducts.filter(p => p.stock === 0).length;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");

  // Adjustment dialog
  const [adjOpen, setAdjOpen] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<AdjustmentType>("Add");
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  // Product add/edit dialog control
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [prefillBarcode, setPrefillBarcode] = useState("");
  
  // Quick price edit dialog
  const [quickPriceOpen, setQuickPriceOpen] = useState(false);
  const [priceEditing, setPriceEditing] = useState<Product | null>(null);
  const [editOnlinePrice, setEditOnlinePrice] = useState("");
  const [editComparePrice, setEditComparePrice] = useState("");
  
  const [delId, setDelId] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanTarget, setScanTarget] = useState<"new" | "form">("new");

  // Label printing
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [labelOpen, setLabelOpen] = useState(false);
  const [labelProducts, setLabelProducts] = useState<Product[]>([]);

  const openLabelsFor = (items: Product[]) => {
    if (items.length === 0) return toast.error("কোনো প্রোডাক্ট সিলেক্ট করা হয়নি");
    setLabelProducts(items);
    setLabelOpen(true);
  };
  const toggleSelect = (id: string) =>
    setSelectedIds((s) => {
      const next = new Set(s);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const openScanForNew = () => { setScanTarget("new"); setScanOpen(true); };
  const openScanForForm = () => { setScanTarget("form"); setScanOpen(true); };

  const handleScanned = (code: string) => {
    setScanOpen(false);
    if (!code) return;
    if (scanTarget === "form") {
      setPrefillBarcode(code);
      toast.success(`Barcode captured: ${code}`);
      return;
    }
    const existing = products.find((p) => p.barcode === code || p.sku === code);
    if (existing) {
      toast.info(`"${existing.name}" already exists — opened for editing`);
      openEdit(existing);
    } else {
      setEditing(null);
      setPrefillBarcode(code);
      setEditOpen(true);
      toast.success(`New barcode ${code} — fill in product details`);
    }
  };

  const openNew = () => {
    setEditing(null);
    setPrefillBarcode("");
    setEditOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setPrefillBarcode("");
    setEditOpen(true);
  };
  
  const openQuickPrice = (p: Product) => {
    setPriceEditing(p);
    setEditOnlinePrice(p.onlinePrice != null ? String(p.onlinePrice) : "");
    setEditComparePrice(p.compareAtPrice != null ? String(p.compareAtPrice) : "");
    setQuickPriceOpen(true);
  };
  
  const confirmDelete = () => {
    if (!delId) return;
    deleteProduct.mutate(delId);
    toast.success("Product deleted");
    setDelId(null);
  };
  
  const submitQuickPrice = async () => {
    if (!priceEditing) return;
    const patch: Partial<Product> = {};
    patch.onlinePrice = editOnlinePrice ? Number(editOnlinePrice) : (null as any);
    patch.compareAtPrice = editComparePrice ? Number(editComparePrice) : (null as any);
    
    updateProduct.mutate({ id: priceEditing.id, patch });
    setQuickPriceOpen(false);
  };

  const filtered = useMemo(() => {
    return warehouseProducts.filter((p) => {
      const reorder = effectiveReorderPoint(p);
      const matchesFilter =
        filter === "All" ||
        (filter === "Low" && p.stock > 0 && p.stock <= reorder) ||
        (filter === "Out" && p.stock === 0) ||
        (filter === "OK" && p.stock > reorder) ||
        (filter === "Reorder" && p.type !== "bundle" && p.stock <= reorder);
      const q = search.toLowerCase();
      const matchesSearch =
        (p.name || "").toLowerCase().includes(q) || 
        (p.sku || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.model || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [warehouseProducts, search, filter]);

  const isFilterEmpty = !search.trim() && filter === "All";
  const displayedProducts = isFilterEmpty ? filtered.slice(0, 5) : filtered;

  // --- Price List Functionality ---
  const priceListRef = useRef<HTMLDivElement>(null);
  
  const handlePrintPriceList = useReactToPrint({
    contentRef: priceListRef,
    documentTitle: "Product Price List",
  });

  const handleDownloadJpg = async () => {
    if (!priceListRef.current) return;
    try {
      toast.info("Generating Image...");
      const el = priceListRef.current;
      el.style.display = 'block';
      el.style.position = 'absolute';
      el.style.top = '0';
      el.style.left = '0';
      el.style.zIndex = '-9999';
      
      const dataUrl = await toJpeg(el, { quality: 0.95, backgroundColor: '#ffffff' });
      
      el.style.display = 'none';

      const link = document.createElement("a");
      link.download = `price_list_${new Date().getTime()}.jpg`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate image");
      if (priceListRef.current) priceListRef.current.style.display = 'none';
    }
  };

  const handleShareList = async () => {
    if (!navigator.share) {
      toast.error("Sharing is not supported on this device/browser");
      return;
    }
    try {
      if (!priceListRef.current) return;
      const el = priceListRef.current;
      el.style.display = 'block';
      el.style.position = 'absolute';
      el.style.top = '0';
      el.style.left = '0';
      el.style.zIndex = '-9999';
      
      const dataUrl = await toJpeg(el, { quality: 0.9, backgroundColor: '#ffffff' });
      el.style.display = 'none';

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'price_list.jpg', { type: 'image/jpeg' });

      await navigator.share({
        title: "Product Price List",
        text: "Here is the latest product price list.",
        files: [file]
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(err);
        toast.error("Failed to share the list");
      }
      if (priceListRef.current) priceListRef.current.style.display = 'none';
    }
  };

  // Category management
  const [newCatName, setNewCatName] = useState("");
  const [newSubParentId, setNewSubParentId] = useState<string>("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const isParentCat = (c: typeof categories[number]) => !c.parentId || c.parentId === c.id;
  const parentCats = useMemo(
    () => categories.filter(isParentCat).sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );
  const subCatsOf = (pid: string) =>
    categories.filter((c) => c.parentId === pid && c.id !== pid).sort((a, b) => a.name.localeCompare(b.name));

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return toast.error("Category name required");
    const parentId = newSubParentId || null;
    const dup = categories.some(
      (c) => (c.parentId ?? null) === parentId && c.name.toLowerCase() === name.toLowerCase()
    );
    if (dup) return toast.error("Category already exists");
    createCategory({ name, parentId: parentId ?? undefined });
    setNewCatName("");
    setNewSubParentId("");
    toast.success(parentId ? "Sub-category added" : "Category added");
    if (parentId) setExpandedCats((s) => ({ ...s, [parentId]: true }));
  };
  const handleRename = (id: string) => {
    const name = renameValue.trim();
    if (!name) return toast.error("Name required");
    const old = categories.find((c) => c.id === id);
    if (!old) return;
    if (categories.some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) {
      return toast.error("Name already used");
    }
    updateCategoryApi(id, { name });
    // cascade rename to products that referenced the old name
    products.filter((p) => p.category === old.name).forEach((p) => updateProduct.mutate({ id: p.id, patch: { category: name as Category } }));
    setRenameId(null);
    setRenameValue("");
    toast.success("Category renamed");
  };
  const toggleCategoryActive = (_id: string, active: boolean) => {
    toast.success(active ? "Category enabled" : "Category disabled");
  };
  const removeCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    const inUse = products.some((p) => p.category === cat.name);
    if (inUse) return toast.error("Cannot delete: products are using this category. Disable it instead.");
    removeCategoryApi(id);
    toast.success("Category deleted");
  };

  const submitAdjust = async () => {
    setAdjusting(true);
    const q = Number(qty);
    if (!productId) { setAdjusting(false); return toast.error("Select a product"); }
    if (!q || q < 0) { setAdjusting(false); return toast.error("Enter a valid quantity"); }
    if (!reason.trim()) { setAdjusting(false); return toast.error("Reason is required"); }
    try {
      await adjust({ productId, type, qty: q, reason, reference: reference.trim() || undefined, note });
      toast.success("Stock adjusted & history updated");
      setAdjOpen(false);
      setProductId(""); setQty("1"); setReason(""); setReference(""); setNote(""); setType("Add");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Adjustment failed");
    } finally {
      setAdjusting(false);
    }
  };

  const renderTabsList = () => (
    <TabsList className="bg-gray-50/50 border border-gray-100 p-1 h-auto flex w-full justify-between sm:justify-start sm:w-auto">
      <TabsTrigger value="overview" className="flex-1 sm:flex-none px-2 sm:px-4 py-1.5 text-[11px] sm:text-sm">Overview</TabsTrigger>
      {!filterOnlineOnly && (
        <TabsTrigger value="adjustments" className="flex-1 sm:flex-none px-2 sm:px-4 py-1.5 text-[11px] sm:text-sm"><History className="hidden sm:inline-block h-3.5 w-3.5 mr-1" />Adjustments</TabsTrigger>
      )}
    </TabsList>
  );

  return (
    <div className="space-y-0">
      <PageHeader
        className="!mb-0"
        title={filterOnlineOnly ? "E-commerce Catalog" : "Inventory Command Center"}
        description={filterOnlineOnly 
          ? "Manage published products and track availability." 
          : "Track stock value, categories, and audit adjustments."}
        actions={
          <div className="flex items-center gap-1.5 sm:gap-3 w-full sm:w-auto">
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 px-1.5 sm:px-3 py-1.5 rounded-lg flex flex-col justify-center min-w-0 flex-1 sm:flex-none">
              <p className="text-[8px] sm:text-[10px] text-white/80 uppercase font-semibold tracking-wider truncate" title="Stock Value">Stock Value</p>
              <p className="text-xs sm:text-sm font-bold mt-0.5 text-white truncate">{formatCurrency(stockValue)}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 px-1.5 sm:px-3 py-1.5 rounded-lg flex flex-col justify-center min-w-0 flex-1 sm:flex-none">
              <p className="text-[8px] sm:text-[10px] text-white/80 uppercase font-semibold tracking-wider truncate" title="Low Stock">Low Stock</p>
              <p className="text-xs sm:text-sm font-bold mt-0.5 text-white truncate">{lowCount} items</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 px-1.5 sm:px-3 py-1.5 rounded-lg flex flex-col justify-center min-w-0 flex-1 sm:flex-none">
              <p className="text-[8px] sm:text-[10px] text-white/80 uppercase font-semibold tracking-wider truncate" title="Out of Stock">Out of Stock</p>
              <p className="text-xs sm:text-sm font-bold mt-0.5 text-white truncate">{outCount} items</p>
            </div>
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsContent value="overview" className="space-y-0 m-0">
          <Card className="p-2 sm:p-3 flex flex-col xl:flex-row gap-2 sm:gap-3 items-start xl:items-center rounded-t-none border-t-0 shadow-sm">
            {renderTabsList()}
            <div className="h-4 w-px bg-border hidden xl:block" />
            <div className="flex-1 flex flex-col sm:flex-row w-full gap-2 sm:gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, SKU, brand, or category…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 sm:h-10 text-sm" />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {warehouses.length > 1 && (
                  <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
                    <SelectTrigger className="flex-1 sm:flex-none sm:w-44 h-9 sm:h-10 text-xs sm:text-sm"><SelectValue placeholder="All Warehouses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Warehouses</SelectItem>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="flex-1 sm:flex-none sm:w-44 h-9 sm:h-10 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All stock</SelectItem>
                    <SelectItem value="OK">Healthy</SelectItem>
                    <SelectItem value="Low">Low stock</SelectItem>
                    <SelectItem value="Reorder">Needs reorder</SelectItem>
                    <SelectItem value="Out">Out of stock</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 sm:h-10 px-3 sm:px-4 text-slate-700 bg-white">
                      <Printer className="h-4 w-4 sm:mr-2 text-indigo-500" /><span className="hidden sm:inline">Price List</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handlePrintPriceList()}>
                      <Printer className="h-4 w-4 mr-2 text-indigo-500" /> Print / Save PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadJpg}>
                      <Download className="h-4 w-4 mr-2 text-emerald-500" /> Download JPG
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleShareList}>
                      <Share2 className="h-4 w-4 mr-2 text-blue-500" /> Share List
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {!filterOnlineOnly && (
                  <Button onClick={() => setAdjOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 sm:h-10 px-3 sm:px-4 shrink-0">
                    <Plus className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">New Adjustment</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>



          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <Card className="p-3 flex items-center justify-between gap-2 border-slate-200 bg-slate-50">
              <span className="text-sm">
                <span className="font-semibold">{selectedIds.size}</span> selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    openLabelsFor(filtered.filter((p) => selectedIds.has(p.id)))
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Labels
                </Button>
              </div>
            </Card>
          )}

          <InventoryProductMobileList
            products={displayedProducts}
            onQuickAdjust={(id) => { setProductId(id); setType("Add"); setAdjOpen(true); }}
            onEdit={openEdit}
            onDelete={(id) => setDelId(id)}
            onPrintLabel={(p) => openLabelsFor([p])}
            onQuickEditPrice={openQuickPrice}
            isOnlineInventory={filterOnlineOnly}
          />

          <InventoryProductTable
            products={displayedProducts}
            onQuickAdjust={(id) => { setProductId(id); setType("Add"); setAdjOpen(true); }}
            onEdit={openEdit}
            onDelete={(id) => setDelId(id)}
            onPrintLabel={(p) => openLabelsFor([p])}
            onQuickEditPrice={openQuickPrice}
            isOnlineInventory={filterOnlineOnly}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleAll={(all) =>
              setSelectedIds(all ? new Set(filtered.map((p) => p.id)) : new Set())
            }
          />

        </TabsContent>



        <TabsContent value="adjustments" className="space-y-4 m-0">
          <Card className="p-2 sm:p-3 flex flex-col xl:flex-row gap-2 sm:gap-3 items-start xl:items-center">
            {renderTabsList()}
          </Card>
          <AdjustmentsHistory adjustments={adjustments} />
        </TabsContent>
      </Tabs>

      {/* Adjustment Dialog */}
      <Dialog open={adjOpen} onOpenChange={setAdjOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Stock Adjustment</DialogTitle>
            <DialogDescription>Record a change to stock with a reason for audit trail.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Product">
              <AutoSuggest
                value={productId}
                onValueChange={setProductId}
                options={products.map((p) => ({
                  value: p.id,
                  label: p.name,
                  badge: p.stock != null ? `Stock: ${p.stock}` : undefined,
                }))}
                placeholder="Search product…"
                emptyMessage="No product found"
                debounceMs={200}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <Select value={type} onValueChange={(v) => setType(v as AdjustmentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Add">Add</SelectItem>
                    <SelectItem value="Remove">Remove</SelectItem>
                    <SelectItem value="Set">Set to</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Quantity">
                <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
              </Field>
            </div>
            <Field label="Reason">
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue placeholder="Pick a reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Found">Found / Recount</SelectItem>
                  <SelectItem value="Lost">Lost / Theft</SelectItem>
                  <SelectItem value="Return to supplier">Return to supplier</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Reference (PO #, invoice, doc no.)">
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. PO-2024-0042 or DMG-0091" />
            </Field>
            <Field label="Note">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional details" />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjOpen(false)}>Cancel</Button>
            <LoadingButton className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={submitAdjust} loading={adjusting}>
              Save Adjustment
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProductFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editing={editing}
        prefillBarcode={prefillBarcode}
        onScanRequest={openScanForForm}
      />

      {/* Hidden Price List for Printing / Exporting */}
      <div style={{ display: 'none' }}>
        <div ref={priceListRef} className="p-10 bg-white text-black min-h-screen w-[800px] mx-auto font-sans">
          <div className="flex justify-between items-start mb-10 text-[10px] text-gray-500">
            <div>{new Date().toLocaleString()}</div>
            <div>Price List</div>
          </div>
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">PRODUCT PRICE LIST</h1>
            <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleDateString('en-GB')}</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-2 text-xs font-bold text-gray-600 uppercase tracking-wider w-[50%]">Product Name</th>
                <th className="py-3 px-2 text-xs font-bold text-gray-600 uppercase tracking-wider w-[25%]">Category</th>
                <th className="py-3 px-2 text-xs font-bold text-gray-600 uppercase tracking-wider text-right w-[25%]">Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="py-3 px-2 text-[13px] text-gray-800 font-medium">{p.name}</td>
                  <td className="py-3 px-2 text-[12px] text-gray-600 uppercase">{p.category || '—'}</td>
                  <td className="py-3 px-2 text-[13px] text-gray-800 font-medium text-right">{formatCurrency(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-10 text-[10px] text-gray-400 text-center">
            {filtered.length} products listed.
          </div>
        </div>
      </div>

      {/* Quick Price Edit Dialog */}
      <Dialog open={quickPriceOpen} onOpenChange={setQuickPriceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Price Edit</DialogTitle>
            <DialogDescription>
              {priceEditing?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Field label="Online Sell Price">
              <Input type="number" value={editOnlinePrice} onChange={(e) => setEditOnlinePrice(e.target.value)} placeholder="e.g. 500" autoFocus />
            </Field>
            <Field label="Compare At Price (Strikethrough)">
              <Input type="number" value={editComparePrice} onChange={(e) => setEditComparePrice(e.target.value)} placeholder="e.g. 600" />
            </Field>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setQuickPriceOpen(false)}>Cancel</Button>
            <LoadingButton className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={submitQuickPrice} loading={updateProduct.isPending}>
              Save
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the product from inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CameraScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onDetected={handleScanned}
      />

      <LabelPrintDialog
        open={labelOpen}
        onOpenChange={setLabelOpen}
        products={labelProducts}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
