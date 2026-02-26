"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  Minus,
  PlusCircle,
  Trash2,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  quantity: number;
  unit: string;
  minStock: number;
  costPerUnit: number | null;
  location: string | null;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");

  useEffect(() => {
    fetchItems();
  }, [search, showLowOnly]);

  async function fetchItems() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (showLowOnly) params.set("lowStock", "true");

    const res = await fetch(`/api/inventory?${params}`);
    setItems(await res.json());
    setLoading(false);
  }

  async function adjustStock(itemId: string, amount: number) {
    await fetch(`/api/inventory/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adjustQuantity: amount }),
    });
    setAdjusting(null);
    setAdjustAmount("");
    fetchItems();
  }

  async function deleteItem(itemId: string) {
    if (!confirm("Delete this inventory item?")) return;
    await fetch(`/api/inventory/${itemId}`, { method: "DELETE" });
    fetchItems();
  }

  function isLowStock(item: InventoryItem) {
    return item.minStock > 0 && item.quantity <= item.minStock;
  }

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Track parts, materials, and stock levels"
        action={
          <Link
            href="/inventory/new"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
          >
            <Plus size={18} />
            Add Item
          </Link>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          onClick={() => setShowLowOnly(!showLowOnly)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            showLowOnly
              ? "bg-warning text-white"
              : "bg-card-bg border border-border text-muted hover:bg-gray-50"
          }`}
        >
          <AlertTriangle size={16} />
          Low Stock
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading inventory...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-muted">
            <Package size={32} className="mx-auto mb-2 opacity-50" />
            <p>No items found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left p-3 font-medium text-muted">Item</th>
                    <th className="text-left p-3 font-medium text-muted">SKU</th>
                    <th className="text-left p-3 font-medium text-muted">Location</th>
                    <th className="text-right p-3 font-medium text-muted">Stock</th>
                    <th className="text-right p-3 font-medium text-muted">Min</th>
                    <th className="text-right p-3 font-medium text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {isLowStock(item) && (
                            <AlertTriangle size={14} className="text-warning flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.category && (
                              <p className="text-xs text-muted">{item.category}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs text-muted">
                        {item.sku || "—"}
                      </td>
                      <td className="p-3 text-muted">{item.location || "—"}</td>
                      <td className="p-3 text-right">
                        <span
                          className={`font-medium ${
                            isLowStock(item) ? "text-danger" : ""
                          }`}
                        >
                          {item.quantity}
                        </span>{" "}
                        <span className="text-muted">{item.unit}</span>
                      </td>
                      <td className="p-3 text-right text-muted">{item.minStock}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {adjusting === item.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={adjustAmount}
                                onChange={(e) => setAdjustAmount(e.target.value)}
                                placeholder="±qty"
                                className="w-20 px-2 py-1 border border-border rounded text-sm text-center"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  if (adjustAmount) adjustStock(item.id, parseInt(adjustAmount));
                                }}
                                className="px-2 py-1 bg-primary text-white rounded text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => { setAdjusting(null); setAdjustAmount(""); }}
                                className="px-2 py-1 text-xs text-muted"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => adjustStock(item.id, -1)}
                                className="p-1.5 rounded hover:bg-gray-100 text-muted"
                                title="Remove 1"
                              >
                                <Minus size={14} />
                              </button>
                              <button
                                onClick={() => adjustStock(item.id, 1)}
                                className="p-1.5 rounded hover:bg-gray-100 text-muted"
                                title="Add 1"
                              >
                                <PlusCircle size={14} />
                              </button>
                              <button
                                onClick={() => setAdjusting(item.id)}
                                className="px-2 py-1 rounded text-xs text-primary hover:bg-blue-50"
                              >
                                Adjust
                              </button>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-danger"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {isLowStock(item) && (
                          <AlertTriangle size={14} className="text-warning" />
                        )}
                        <p className="font-medium">{item.name}</p>
                      </div>
                      {item.sku && (
                        <p className="text-xs text-muted font-mono">{item.sku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          isLowStock(item) ? "text-danger" : ""
                        }`}
                      >
                        {item.quantity}{" "}
                        <span className="text-xs font-normal text-muted">
                          {item.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-muted">
                      {item.location && <span>Bin: {item.location}</span>}
                      {item.minStock > 0 && <span>Min: {item.minStock}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustStock(item.id, -1)}
                        className="p-2 rounded-lg bg-gray-100 active:bg-gray-200"
                      >
                        <Minus size={16} />
                      </button>
                      <button
                        onClick={() => adjustStock(item.id, 1)}
                        className="p-2 rounded-lg bg-gray-100 active:bg-gray-200"
                      >
                        <PlusCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
