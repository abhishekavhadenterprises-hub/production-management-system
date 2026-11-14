import React, { useState, useMemo } from "react";
import Head from "next/head";
import {
  Package,
  Search,
  Plus,
  RotateCcw,
  CheckCircle2,
  X,
  ChevronDown,
  Save,
  ArrowRightLeft,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryStockItem } from "@/lib/masters-types";
import { INITIAL_INVENTORY_STOCK } from "@/lib/masters-mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export function InventoryStockView() {
  const [stockItems, setStockItems] = usePersistentState<InventoryStockItem[]>(
    "prodsync_master_inventory_stock",
    INITIAL_INVENTORY_STOCK
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("All Warehouses");
  const [itemTypeFilter, setItemTypeFilter] = useState("All Item Types");
  const [healthFilter, setHealthFilter] = useState("All Health Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals: Receive Stock Modal & Ledger Modal
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedLedgerItem, setSelectedLedgerItem] = useState<InventoryStockItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Receive Stock Form
  const [receiveForm, setReceiveForm] = useState({
    itemId: INITIAL_INVENTORY_STOCK[0]?.id || "",
    warehouse: INITIAL_INVENTORY_STOCK[0]?.warehouse || "",
    quantity: 100,
    receiptDate: new Date().toISOString().split("T")[0],
    reference: "PO-GRN-2026-881",
    remarks: "Received from verified supplier",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const warehouses = useMemo(() => {
    const set = new Set(stockItems.map((s) => s.warehouse));
    return ["All Warehouses", ...Array.from(set)];
  }, [stockItems]);

  const itemTypes = useMemo(() => {
    const set = new Set(stockItems.map((s) => s.itemType));
    return ["All Item Types", ...Array.from(set)];
  }, [stockItems]);

  const filteredItems = useMemo(() => {
    return stockItems.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.itemCode.toLowerCase().includes(q) ||
        item.itemName.toLowerCase().includes(q) ||
        item.warehouse.toLowerCase().includes(q);

      const matchWarehouse =
        warehouseFilter === "All Warehouses" || item.warehouse === warehouseFilter;

      const matchType =
        itemTypeFilter === "All Item Types" || item.itemType === itemTypeFilter;

      const matchHealth =
        healthFilter === "All Health Statuses" || item.stockHealth === healthFilter;

      return matchSearch && matchWarehouse && matchType && matchHealth;
    });
  }, [stockItems, searchQuery, warehouseFilter, itemTypeFilter, healthFilter]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;

  // 3 Summary Cards matching spec: Stocked Items, Low-Stock Items, Out-of-Stock Items (do not combine different units into one total quantity)
  const stockedItemsCount = stockItems.filter((i) => i.currentStock > 0).length;
  const lowStockItemsCount = stockItems.filter((i) => i.stockHealth === "Low Stock").length;
  const outOfStockItemsCount = stockItems.filter((i) => i.stockHealth === "Out of Stock" || i.currentStock <= 0).length;

  const handleClearFilters = () => {
    setSearchQuery("");
    setWarehouseFilter("All Warehouses");
    setItemTypeFilter("All Item Types");
    setHealthFilter("All Health Statuses");
    setCurrentPage(1);
  };

  // Open Receive Stock Modal
  const handleOpenReceiveModal = (item?: InventoryStockItem) => {
    const target = item || stockItems[0];
    setReceiveForm({
      itemId: target.id,
      warehouse: target.warehouse,
      quantity: 50,
      receiptDate: new Date().toISOString().split("T")[0],
      reference: `GRN-${Math.floor(1000 + Math.random() * 9000)}`,
      remarks: "Direct inventory replenishment receipt",
    });
    setErrors({});
    setIsReceiveModalOpen(true);
  };

  const handleSaveReceive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveForm.quantity || receiveForm.quantity <= 0) {
      setErrors({ quantity: "Received quantity must be greater than 0" });
      return;
    }

    setIsSaving(true);
    setErrors({});

    setTimeout(() => {
      setStockItems((prev) =>
        prev.map((item) => {
          if (item.id === receiveForm.itemId) {
            const newCurrent = item.currentStock + receiveForm.quantity;
            const newAvailable = newCurrent - item.reservedStock;
            let health: InventoryStockItem["stockHealth"] = "Normal";
            if (newAvailable <= 0) health = "Out of Stock";
            else if (newAvailable <= item.minimumStock) health = "Low Stock";

            return {
              ...item,
              currentStock: newCurrent,
              availableStock: newAvailable,
              stockHealth: health,
              lastStockUpdate: new Date().toISOString().replace("T", " ").substring(0, 16),
            };
          }
          return item;
        })
      );
      showToast(`Stock received: +${receiveForm.quantity} units successfully updated in ledger.`);
      setIsSaving(false);
      setIsReceiveModalOpen(false);
    }, 250);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1D1D1F]">
      <Head>
        <title>Inventory &amp; Stock Master - PRODSYNC Operations</title>
        <meta name="description" content="Central raw material stock, bought-out items, reserve balances, and ledger" />
      </Head>

      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1D1D1F] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-white/10 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#E5E5EA] px-4 py-3.5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shadow-xs shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Inventory &amp; Stock Master</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]">
                  STORE INVENTORY
                </span>
              </div>
              <p className="text-xs text-[#86868B] mt-0.5">
                Raw material tubes, bought-out fittings, calculated reserve balances, and stock ledger
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenReceiveModal()}
            className="px-3.5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Receive Stock (GRN)</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Cards matching spec: Stocked Items, Low-Stock Items, Out-of-Stock Items */}
      <div className="px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#10B981] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>STOCKED ITEMS</span>
              <span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] text-[9.5px] font-bold">In Warehouse</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10B981] mt-2">{stockedItemsCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Item SKUs with positive inventory balance</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#F59E0B] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>LOW-STOCK ITEMS</span>
              <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-[9.5px] font-bold">Reorder Level</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#F59E0B] mt-2">{lowStockItemsCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Available balance below configured minimum</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E5EA] border-l-4 border-l-[#EF4444] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>OUT-OF-STOCK ITEMS</span>
              <span className="px-2 py-0.5 rounded bg-[#FEE2E2] text-[#DC2626] text-[9.5px] font-bold">Stockout</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#DC2626] mt-2">{outOfStockItemsCount}</div>
            <span className="text-[11px] text-[#86868B] mt-1">Zero balance items awaiting purchase delivery</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="px-4 pb-2 sm:px-6">
        <div className="bg-white p-3 rounded-xl border border-[#E5E5EA] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[220px] flex-1">
              <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Item Code, Name, Warehouse..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF]"
              />
            </div>

            <div className="relative min-w-[190px]">
              <select
                value={warehouseFilter}
                onChange={(e) => { setWarehouseFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] cursor-pointer"
              >
                {warehouses.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="relative min-w-[170px]">
              <select
                value={itemTypeFilter}
                onChange={(e) => { setItemTypeFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] cursor-pointer"
              >
                {itemTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="relative min-w-[150px]">
              <select
                value={healthFilter}
                onChange={(e) => { setHealthFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none px-3 py-1.5 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:border-[#007AFF] cursor-pointer"
              >
                <option value="All Health Statuses">All Health Statuses</option>
                <option value="Normal">Normal</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {(searchQuery || warehouseFilter !== "All Warehouses" || itemTypeFilter !== "All Item Types" || healthFilter !== "All Health Statuses") && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 rounded-lg border border-[#E5E5EA] bg-white hover:bg-[#F5F5F7] text-xs font-medium text-[#6E6E73] flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="px-4 py-2 sm:px-6 flex-1 flex flex-col pb-12">
        <div className="bg-white rounded-xl border border-[#E5E5EA] shadow-xs overflow-x-auto flex-1 flex flex-col justify-between">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E5EA] text-[10.5px] font-bold text-[#6E6E73] uppercase tracking-wider select-none">
                <th className="px-3 py-3 min-w-[130px]">ITEM CODE</th>
                <th className="px-3 py-3 min-w-[220px]">ITEM NAME</th>
                <th className="px-3 py-3 min-w-[190px]">WAREHOUSE</th>
                <th className="px-3 py-3 text-center min-w-[80px]">UOM</th>
                <th className="px-3 py-3 text-right min-w-[110px]">CURRENT STOCK</th>
                <th className="px-3 py-3 text-right min-w-[110px]">RESERVED STOCK</th>
                <th className="px-3 py-3 text-right min-w-[120px]">AVAILABLE STOCK</th>
                <th className="px-3 py-3 text-right min-w-[110px]">MINIMUM STOCK</th>
                <th className="px-3 py-3 text-center min-w-[120px]">STOCK HEALTH</th>
                <th className="px-3 py-3 text-center min-w-[110px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F7]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-[#86868B]">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <Package className="w-8 h-8 text-[#C7C7CC] mb-2" />
                      <p className="text-sm font-semibold text-[#1D1D1F]">No Inventory Items Found</p>
                      <p className="text-xs text-[#86868B] mt-1">Try resetting search filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] font-mono text-[11px] font-semibold">
                          {item.itemCode}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-[#1D1D1F]">
                        <div>
                          <span>{item.itemName}</span>
                          <span className="text-[10px] text-[#86868B] block mt-0.5">{item.itemType}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#52525B]">
                        <span className="truncate block max-w-[180px]">{item.warehouse}</span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-semibold text-[#52525B]">{item.uom}</td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-[#1D1D1F]">
                        {item.currentStock.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-[#86868B]">
                        {item.reservedStock.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-[#007AFF]">
                        {item.availableStock.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-[#52525B]">
                        {item.minimumStock.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1",
                            item.stockHealth === "Normal" && "bg-[#EAF8EF] text-[#16A34A] border border-[#34C759]/30",
                            item.stockHealth === "Low Stock" && "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30",
                            item.stockHealth === "Out of Stock" && "bg-[#FEE2E2] text-[#DC2626] border border-[#EF4444]/30"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              item.stockHealth === "Normal" && "bg-[#16A34A]",
                              item.stockHealth === "Low Stock" && "bg-[#F59E0B]",
                              item.stockHealth === "Out of Stock" && "bg-[#DC2626]"
                            )}
                          />
                          <span>{item.stockHealth}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedLedgerItem(item)}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold text-[#007AFF] hover:bg-[#E8F2FE] transition-colors flex items-center gap-1"
                            title="View Stock Ledger"
                          >
                            <History className="w-3 h-3" />
                            <span>Ledger</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-[#E5E5EA] bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6E6E73] select-none">
            <div>
              Showing <span className="font-semibold text-[#1D1D1F]">{filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to <span className="font-semibold text-[#1D1D1F]">{Math.min(currentPage * pageSize, filteredItems.length)}</span> of <span className="font-semibold text-[#1D1D1F]">{filteredItems.length}</span> inventory items
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-[#E5E5EA] bg-white text-[#1D1D1F] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F5F7] text-xs"
              >
                Previous
              </button>
              <span className="px-2 text-xs font-medium text-[#1D1D1F]">{currentPage} / {totalPages}</span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-[#E5E5EA] bg-white text-[#1D1D1F] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F5F7] text-xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receive Stock Modal */}
      {isReceiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5EA] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <h3 className="text-base font-bold text-[#1D1D1F]">Receive Inventory Stock (GRN)</h3>
              </div>
              <button onClick={() => setIsReceiveModalOpen(false)} className="p-1 rounded-lg hover:bg-[#F5F5F7] text-[#86868B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReceive} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  Item Selection <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={receiveForm.itemId}
                    onChange={(e) => {
                      const sel = stockItems.find((s) => s.id === e.target.value);
                      setReceiveForm({
                        ...receiveForm,
                        itemId: e.target.value,
                        warehouse: sel ? sel.warehouse : receiveForm.warehouse,
                      });
                    }}
                    className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-[#E5E5EA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#007AFF]"
                  >
                    {stockItems.map((s) => (
                      <option key={s.id} value={s.id}>{s.itemCode} — {s.itemName}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                  Destination Warehouse <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={receiveForm.warehouse}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg text-xs text-[#52525B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Quantity Received <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={receiveForm.quantity}
                    onChange={(e) => setReceiveForm({ ...receiveForm, quantity: parseFloat(e.target.value) || 0 })}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-bold focus:outline-none",
                      errors.quantity ? "border-[#EF4444] bg-[#FFF5F5]" : "border-[#E5E5EA] focus:border-[#007AFF]"
                    )}
                  />
                  {errors.quantity && <span className="text-[10px] text-[#EF4444] mt-0.5 block">{errors.quantity}</span>}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                    Receipt Date <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="date"
                    value={receiveForm.receiptDate}
                    onChange={(e) => setReceiveForm({ ...receiveForm, receiptDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs focus:outline-none focus:border-[#007AFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Invoice / GRN Reference (Optional)</label>
                <input
                  type="text"
                  value={receiveForm.reference}
                  onChange={(e) => setReceiveForm({ ...receiveForm, reference: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs focus:outline-none focus:border-[#007AFF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={receiveForm.remarks}
                  onChange={(e) => setReceiveForm({ ...receiveForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-xs resize-none focus:outline-none focus:border-[#007AFF]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5EA]">
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E5EA] hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Receiving..." : "Confirm Receipt"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Ledger Drawer / Modal */}
      {selectedLedgerItem && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E5EA] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
              <div>
                <span className="text-[10px] font-bold text-[#007AFF] uppercase tracking-wider block">Stock Ledger</span>
                <h3 className="text-base font-bold text-[#1D1D1F]">{selectedLedgerItem.itemCode} &bull; {selectedLedgerItem.itemName}</h3>
              </div>
              <button onClick={() => setSelectedLedgerItem(null)} className="p-1 rounded-lg hover:bg-[#F5F5F7] text-[#86868B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 bg-[#F8F9FA] p-3 rounded-xl border border-[#E5E5EA] text-center">
                <div>
                  <span className="text-[10px] text-[#86868B] block">Current Balance</span>
                  <span className="font-mono font-bold text-sm text-[#1D1D1F]">{selectedLedgerItem.currentStock} {selectedLedgerItem.uom}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#86868B] block">Reserved</span>
                  <span className="font-mono font-bold text-sm text-[#F59E0B]">{selectedLedgerItem.reservedStock} {selectedLedgerItem.uom}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#86868B] block">Available Free</span>
                  <span className="font-mono font-bold text-sm text-[#10B981]">{selectedLedgerItem.availableStock} {selectedLedgerItem.uom}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-[#1D1D1F] block text-xs">Recent Ledger Transactions</span>
                <div className="divide-y divide-[#F2F2F7] border border-[#E5E5EA] rounded-xl overflow-hidden bg-white">
                  <div className="p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-[#1D1D1F] block">GRN Receipt (PO-9921)</span>
                      <span className="text-[10px] text-[#86868B]">2026-11-14 09:30</span>
                    </div>
                    <span className="font-mono font-bold text-[#10B981]">+250 {selectedLedgerItem.uom}</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-[#1D1D1F] block">Production Job Issue (WO-1005)</span>
                      <span className="text-[10px] text-[#86868B]">2026-11-13 14:15</span>
                    </div>
                    <span className="font-mono font-bold text-[#DC2626]">-120 {selectedLedgerItem.uom}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5EA]">
              <button
                type="button"
                onClick={() => setSelectedLedgerItem(null)}
                className="px-4 py-2 rounded-xl border border-[#E5E5EA] hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F]"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
