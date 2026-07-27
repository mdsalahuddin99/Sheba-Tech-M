"use client";

import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { PageHeader, ConfirmDialog } from "@/shared/components";
import { Trash2, Undo2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { listDeletedItemsAction, restoreItemAction, forceDeleteItemAction } from "@/server/actions/trash";

const TABS = [
  { id: "product", label: "Products" },
  { id: "customer", label: "Customers" },
  { id: "supplier", label: "Suppliers" },
  { id: "category", label: "Categories" },
  { id: "sale", label: "Sales" },
];

export function TrashClient() {
  usePageTitle("Trash (Recycle Bin)");
  
  const [activeTab, setActiveTab] = useState("product");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string } | null>(null);
  
  // Sorting state
  const [sortField, setSortField] = useState<"name" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await listDeletedItemsAction(activeTab);
      setItems(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load trash items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleRestore = async (id: string) => {
    try {
      await restoreItemAction(activeTab, id);
      toast.success("Item restored successfully!");
      fetchItems();
    } catch (e: any) {
      toast.error(e.message || "Failed to restore item");
    }
  };

  const handleForceDelete = async () => {
    if (!confirmDelete) return;
    try {
      await forceDeleteItemAction(confirmDelete.type, confirmDelete.id);
      toast.success("Item permanently deleted");
      fetchItems();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete item permanently");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSort = (field: "name" | "date") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "date" ? "desc" : "asc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    if (sortField === "name") {
      const nameA = (a.name || a.slug || a.id || "").toLowerCase();
      const nameB = (b.name || b.slug || b.id || "").toLowerCase();
      return sortDir === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else {
      const dateA = new Date(a.deletedAt).getTime();
      const dateB = new Date(b.deletedAt).getTime();
      return sortDir === "asc" ? dateA - dateB : dateB - dateA;
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Trash" description="Manage deleted items. You can restore them or permanently delete them." />

      <div className="flex gap-2 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="-ml-4 h-8 px-4" onClick={() => handleSort("name")}>
                  Name / Identifier
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="-ml-4 h-8 px-4" onClick={() => handleSort("date")}>
                  Deleted At
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Trash is empty
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.name || item.slug || item.id} 
                    {item.customer && ` (Customer: ${item.customer.name})`}
                  </TableCell>
                  <TableCell>
                    {new Date(item.deletedAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(item.id)}
                        title="Restore"
                      >
                        <Undo2 className="w-4 h-4 mr-1" /> Restore
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmDelete({ type: activeTab, id: item.id })}
                        title="Permanently Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Permanently delete this item?"
        description="This action cannot be undone. The item will be permanently removed from the database."
        onConfirm={handleForceDelete}
        confirmLabel="Delete Permanently"
        destructive
      />
    </div>
  );
}
