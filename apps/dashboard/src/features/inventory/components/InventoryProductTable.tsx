import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { formatCurrency, productDisplayName } from "@/shared/lib/format";
import { categoryName } from "@/shared/lib/categoryName";
import { useLocale } from "@/features/i18n";
import { Plus, ShieldCheck, ShieldAlert, ShieldX, Printer, ShoppingCart, MoreHorizontal, Eye, EyeOff, Sparkles, Tag, Zap } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { getWarrantyStatus, formatWarrantyEnd } from "@/features/products/warranty";
import type { Product } from "@/shared/lib/types";
import { effectiveReorderPoint, suggestedPoQty } from "@/features/products/bundle";
import { useUpdateProduct } from "@/features/products/hooks";
import { useState } from "react";

interface InventoryProductTableProps {
  products: Product[];
  onQuickAdjust: (productId: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onPrintLabel?: (product: Product) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (productId: string) => void;
  onToggleAll?: (allSelected: boolean) => void;
  onQuickEditPrice?: (product: Product) => void;
  isOnlineInventory?: boolean;
}

/** Desktop table view of inventory rows. */
export function InventoryProductTable({
  products,
  onQuickAdjust,
  onEdit,
  onDelete,
  onPrintLabel,
  onQuickEditPrice,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  isOnlineInventory = false,
}: InventoryProductTableProps) {
  const locale = useLocale();
  const updateProduct = useUpdateProduct();

  const selectable = !!selectedIds && !!onToggleSelect;
  const allSelected = selectable && products.length > 0 && products.every(p => selectedIds.has(p.id));
  const someSelected = selectable && products.some(p => selectedIds.has(p.id)) && !allSelected;

  return (
    <Card className="hidden md:block">
      <div className="overflow-x-auto">
        <Table className="text-[12px] border-collapse w-full">
          <TableHeader>
            <TableRow className="bg-[#5B45FF] hover:bg-[#5B45FF] text-white border-none">
              {selectable && (
                <TableHead className="w-10 h-7 py-0 px-2 border border-[#6C57FF] text-white">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={(v) => onToggleAll?.(!!v)}
                    aria-label="Select all"
                    className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#5B45FF]"
                  />
                </TableHead>
              )}
              <TableHead className="h-7 py-0 px-2 border border-[#6C57FF] text-white font-semibold whitespace-nowrap">Product</TableHead>
              <TableHead className="h-7 py-0 px-2 border border-[#6C57FF] text-white font-semibold whitespace-nowrap">SKU</TableHead>
              <TableHead className="h-7 py-0 px-2 border border-[#6C57FF] text-white font-semibold whitespace-nowrap">Cat.</TableHead>
              <TableHead className="hidden lg:table-cell h-7 py-0 px-2 border border-[#6C57FF] text-white font-semibold whitespace-nowrap">Sub-Cat.</TableHead>
              <TableHead className="h-7 py-0 px-2 border border-[#6C57FF] text-white font-semibold whitespace-nowrap text-right">Stock</TableHead>
              <TableHead className="h-7 py-0 px-2 border border-[#6C57FF] text-white font-semibold whitespace-nowrap text-right" title="Min / Reorder Point">Min/Reord</TableHead>
              <TableHead className="h-7 py-0 px-2 border border-[#6C57FF] text-white font-semibold whitespace-nowrap text-right">d/s price</TableHead>
              <TableHead className="h-7 py-0 px-2 border border-[#6C57FF] text-white font-semibold whitespace-nowrap">Status</TableHead>
              <TableHead className="h-7 py-0 px-2 border border-[#6C57FF] text-white font-semibold whitespace-nowrap" title="Warranty">Wrnty.</TableHead>
              <TableHead className="h-7 py-0 px-2 border border-[#6C57FF] text-white font-semibold whitespace-nowrap text-center">Web</TableHead>
              <TableHead className="h-7 py-0 px-2 border border-[#6C57FF] text-white font-semibold whitespace-nowrap text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const out = p.stock === 0;
              const reorderPoint = effectiveReorderPoint(p);
              const needsReorder = p.stock <= reorderPoint;
              const low = !out && needsReorder;
              const w = getWarrantyStatus(p);
              const warrantyHighlight =
                w.kind === "expired" || (w.kind === "active" && w.nearExpiry);
              const isSelected = selectable && selectedIds!.has(p.id);
              return (
                <TableRow
                  key={p.id}
                  className={cn(
                    "hover:bg-slate-50 transition-colors",
                    warrantyHighlight && "bg-warning/5 hover:bg-warning/10",
                    w.kind === "expired" && "bg-destructive/5 hover:bg-destructive/10",
                    isSelected && "bg-primary/5",
                  )}
                >
                  {selectable && (
                    <TableCell className="py-1 px-2 border border-slate-200">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect!(p.id)}
                        aria-label={`Select ${productDisplayName(p)}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="py-1 px-2 border border-slate-200 font-medium max-w-[250px]">
                    <div className="flex items-center gap-2">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={productDisplayName(p)} width={24} height={24} className="h-6 w-6 rounded object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <span className="h-6 w-6 grid place-items-center text-sm shrink-0">{p.emoji}</span>
                      )}
                      <span className="line-clamp-1 leading-snug text-[12px]">{productDisplayName(p)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-2 border border-slate-200 text-slate-600 text-[12px] whitespace-nowrap">{p.sku}</TableCell>
                  <TableCell className="py-1 px-2 border border-slate-200 whitespace-nowrap"><Badge variant="secondary" className="font-medium text-[10px] px-1.5 py-0">{categoryName(p)}</Badge></TableCell>
                  <TableCell className="hidden lg:table-cell py-1 px-2 border border-slate-200 text-slate-500 text-[12px] whitespace-nowrap">{p.subcategory || "—"}</TableCell>
                  <TableCell className="py-1 px-2 border border-slate-200 text-right font-semibold whitespace-nowrap">{p.stock} <span className="text-[10px] font-normal text-slate-500">{p.unit}</span></TableCell>
                  <TableCell className="py-1 px-2 border border-slate-200 text-right text-slate-500 whitespace-nowrap">
                    {p.minStock}/{reorderPoint}
                  </TableCell>
                  <TableCell className="py-1 px-2 border border-slate-200 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer select-none"
                            title="Quick View Margin"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-56 p-3 bg-card border border-border rounded-[4px] shadow-none z-50">
                          <div className="space-y-2 text-xs">
                            <p className="font-bold text-slate-700 border-b border-border pb-1">Cost & Margin Info</p>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Sell Price:</span>
                              <span className="font-medium text-slate-800">{formatCurrency(p.price, locale)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Purchase Cost:</span>
                              <span className="font-medium text-slate-800">{formatCurrency(p.costPrice, locale)}</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
                              <span className="text-slate-700">Margin:</span>
                              <span className={p.costPrice <= p.price ? "text-emerald-600" : "text-destructive"}>
                                {formatCurrency(p.price - p.costPrice, locale)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Margin %:</span>
                              <span className={p.costPrice <= p.price ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>
                                {p.price > 0 ? (((p.price - p.costPrice) / p.price) * 100).toFixed(1) + "%" : "0%"}
                              </span>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-2 border border-slate-200 whitespace-nowrap">
                    {out ? <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/5 font-semibold text-[10px] px-1.5 py-0">Out</Badge> :
                     low ? <Badge variant="outline" className="border-warning/40 text-warning bg-warning/5 font-semibold text-[10px] px-1.5 py-0">Low</Badge> :
                           <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50 font-semibold text-[10px] px-1.5 py-0">OK</Badge>}
                  </TableCell>
                  <TableCell className="py-1 px-2 border border-slate-200 text-[11px] whitespace-nowrap">
                    <div className="flex flex-col gap-0 leading-tight">
                      {w.kind === "none" ? (
                        p.warrantyMonths ? (
                          <span className="text-slate-500">{p.warrantyMonths} mo</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )
                      ) : w.kind === "expired" ? (
                        <span className="inline-flex items-center gap-1 text-destructive font-medium" title={`Expired ${w.daysAgo}d ago`}>
                          <ShieldX className="h-3 w-3" />
                          {formatWarrantyEnd(w.endDate)}
                        </span>
                      ) : w.nearExpiry ? (
                        <span className="inline-flex items-center gap-1 text-warning font-medium" title={`${w.daysLeft} days left`}>
                          <ShieldAlert className="h-3 w-3" />
                          {formatWarrantyEnd(w.endDate)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium" title={`${w.daysLeft} days left`}>
                          <ShieldCheck className="h-3 w-3 text-emerald-500" />
                          {formatWarrantyEnd(w.endDate)}
                        </span>
                      )}
                      {p.warrantyStartDate && (
                        <span className="text-[9px] text-slate-400 ml-4">Pur: {new Date(p.warrantyStartDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-2 border border-slate-200 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={p.active}
                        onCheckedChange={(val) => updateProduct.mutate({ id: p.id, patch: { active: !!val } })}
                        aria-label={`Publish ${productDisplayName(p)}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-2 border border-slate-200 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-slate-900">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {needsReorder && p.type !== "bundle" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/purchases?createPO=${p.id}&qty=${suggestedPoQty(p)}${p.supplierId ? `&supplier=${p.supplierId}` : ""}`} className="w-full flex items-center text-primary focus:text-primary">
                              <ShoppingCart className="mr-2 h-4 w-4" /> Create PO
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {onPrintLabel && (
                          <DropdownMenuItem onClick={() => onPrintLabel(p)}>
                            <Printer className="mr-2 h-4 w-4" /> Print Label
                          </DropdownMenuItem>
                        )}
                        {isOnlineInventory && (
                          <>
                            {onQuickEditPrice && (
                              <DropdownMenuItem onClick={() => onQuickEditPrice(p)}>
                                <Tag className="mr-2 h-4 w-4" /> Edit Online Price
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateProduct.mutate({ id: p.id, patch: { active: !p.active } })}>
                              {p.active ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                              {p.active ? "Hide from E-commerce" : "Show on E-commerce"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateProduct.mutate({ id: p.id, patch: { isTrending: !p.isTrending } })}>
                              <Sparkles className="mr-2 h-4 w-4" />
                              {p.isTrending ? "Remove Trending" : "Mark as Trending"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateProduct.mutate({ id: p.id, patch: { isFlashDeal: !p.isFlashDeal } })}>
                              <Zap className="mr-2 h-4 w-4 text-amber-500" />
                              {p.isFlashDeal ? "Remove Flash Deal" : "Mark as Flash Deal"}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {products.length === 0 && (
              <TableRow><TableCell colSpan={selectable ? 12 : 11} className="py-4 px-2 border border-slate-200 text-center text-muted-foreground">No products match.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
