import React, { useState } from "react";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { WorkOrder } from "@/lib/scheduler-types";
import { cn } from "@/lib/utils";

interface ImportWorkOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newOrders: WorkOrder[]) => void;
  existingWoNumbers: string[];
}

export function ImportWorkOrdersModal({
  isOpen,
  onClose,
  onImport,
  existingWoNumbers,
}: ImportWorkOrdersModalProps) {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("ERP_WorkOrders_Batch_20261024.csv");

  // Sample parsed preview rows
  const [parsedRows, setParsedRows] = useState([
    {
      woNumber: "WO-1052",
      customer: "Godrej Appliances (Godrej & Boyce Mfg)",
      assembly: "HVAC 2-Branch Copper Return Tube Assembly",
      component: "CH-GOD-2B-19",
      quantity: 120,
      dueDate: "29/10/2026",
      status: "Valid",
      hasDuplicate: false,
    },
    {
      woNumber: "WO-1054",
      customer: "Tata Motors Commercial Vehicles",
      assembly: "SS304 Turbo Oil Feed Line Pipe",
      component: "SS-TATA-OIL-12",
      quantity: 250,
      dueDate: "30/10/2026",
      status: "Valid",
      hasDuplicate: false,
    },
    {
      woNumber: "WO-1036", // Simulated duplicate
      customer: "Godrej Appliances",
      assembly: "HVAC 4-Branch Copper Header Manifold",
      component: "CH-GOD-1009-B",
      quantity: 150,
      dueDate: "26/10/2026",
      status: "Duplicate WO Number Detected (Skipped to avoid overwrite)",
      hasDuplicate: true,
    },
  ]);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "WO_Number,Customer,Assembly_Name,Component_Code,Quantity,Due_Date,Priority\n" +
      "WO-2001,Godrej Appliances,Copper Header Assembly,CH-2001-A,100,2026-11-05,High\n" +
      "WO-2002,Tata Motors,Stainless Fuel Line,SS-2002-B,200,2026-11-10,Urgent\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "JPan_WorkOrder_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter((r) => !r.hasDuplicate);
    const newWorkOrders: WorkOrder[] = validRows.map((row) => ({
      id: `wo-${Date.now()}-${row.woNumber}`,
      woNumber: row.woNumber,
      date: "24/10/2026",
      customer: row.customer,
      assembly: row.assembly,
      assemblyCode: `ASSY-${row.woNumber}`,
      priority: "Medium",
      dueDate: row.dueDate,
      orderedQty: row.quantity,
      unscheduledQty: row.quantity,
      producedQty: 0,
      status: "active",
      isSampleData: true,
      components: [
        {
          id: `comp-${row.woNumber}-1`,
          code: row.component,
          name: `${row.assembly} Part`,
          operation: "CNC Rotary Draw Bending",
          bomQty: 1,
          requiredQty: row.quantity,
          scheduledBalance: row.quantity,
          goodOutput: 0,
          rejects: 0,
          remainingQty: row.quantity,
          unit: "pcs",
          readyForScheduling: true,
          stock: {
            required: row.quantity,
            available: row.quantity + 50,
            reserved: row.quantity,
            shortage: 0,
            unit: "pcs",
          },
        },
      ],
    }));

    onImport(newWorkOrders);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E5EA] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5EA] bg-[#F8F9FA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#007AFF] text-white">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-[#1D1D1F]">
                Bulk Import Work Orders
              </span>
              <p className="text-xs text-[#86868B] mt-0.5">
                Upload CSV or Excel file exported from ERP with duplicate verification.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5EA] rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Template Download banner */}
          <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#007AFF]" />
              <div>
                <div className="font-semibold text-xs text-[#1D1D1F]">
                  Download Official Import Template
                </div>
                <div className="text-[10px] text-[#86868B]">
                  Pre-configured with standard header mappings and sample rows
                </div>
              </div>
            </div>

            <button
              onClick={downloadTemplate}
              className="px-3 py-1.5 bg-white border border-[#E5E5EA] text-[#007AFF] hover:bg-[#E8F2FE] font-medium rounded-lg shadow-2xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div className="p-5 border-2 border-dashed border-[#D1D1D6] hover:border-[#007AFF] rounded-2xl text-center bg-[#FAFAFC] cursor-pointer transition-colors space-y-2">
            <FileCheck className="w-8 h-8 text-[#007AFF] mx-auto opacity-80" />
            <div className="font-semibold text-xs text-[#1D1D1F]">
              {fileName}
            </div>
            <div className="text-[10.5px] text-[#86868B]">
              Ready for preview (3 rows detected, 2 valid, 1 duplicate conflict)
            </div>
          </div>

          {/* Parsed Preview Table */}
          <div>
            <div className="font-bold text-xs text-[#1D1D1F] mb-1.5 flex items-center justify-between">
              <span>Import Preview & Validation Mapping</span>
              <span className="text-[10.5px] text-[#86868B]">
                2 of 3 rows ready to commit
              </span>
            </div>

            <div className="border border-[#E5E5EA] rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-[#F8F9FA] border-b border-[#E5E5EA] text-[#86868B] font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="p-2">WO #</th>
                    <th className="p-2">Customer</th>
                    <th className="p-2">Assembly</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA]">
                  {parsedRows.map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        row.hasDuplicate ? "bg-[#FFEBEA]/40" : "bg-white"
                      )}
                    >
                      <td className="p-2 font-mono font-bold text-[#1D1D1F]">
                        {row.woNumber}
                      </td>
                      <td className="p-2 text-[#48484A] truncate max-w-[140px]">
                        {row.customer}
                      </td>
                      <td className="p-2 text-[#48484A] truncate max-w-[150px]">
                        {row.assembly}
                      </td>
                      <td className="p-2 font-mono font-semibold text-[#1D1D1F]">
                        {row.quantity}
                      </td>
                      <td className="p-2">
                        {row.hasDuplicate ? (
                          <span className="text-[9.5px] text-[#B82218] font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Duplicate (Skipped)</span>
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-[#1E823B] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span>Ready</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E5E5EA] bg-[#F8F9FA] flex items-center justify-between">
          <span className="text-[11px] text-[#86868B]">
            Never silently overwrites existing records.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-[#48484A] hover:bg-[#E5E5EA] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#007AFF] text-white hover:bg-[#0058B3] shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & Append 2 Work Orders</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
