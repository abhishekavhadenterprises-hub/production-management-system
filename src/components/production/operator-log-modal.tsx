import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Factory,
  User,
  Clock,
  Sparkles,
} from "lucide-react";
import { ProductionRecord } from "@/lib/production-types";
import { REJECTION_REASONS } from "@/lib/production-mock-data";
import { PremiumNumberInput } from "@/components/ui/premium-number-input";
import { PremiumDropdown } from "@/components/ui/premium-dropdown";

interface OperatorLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ProductionRecord | null;
  onSave: (
    updatedRecord: ProductionRecord,
    newOk: number,
    newNg: number,
    rejectionReason: string,
    operatorNotes: string
  ) => void;
}

export function OperatorLogModal({
  isOpen,
  onClose,
  record,
  onSave,
}: OperatorLogModalProps) {
  const [okQty, setOkQty] = useState<number>(0);
  const [ngQty, setNgQty] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [operatorNotes, setOperatorNotes] = useState<string>("");
  const [operatorName, setOperatorName] = useState<string>("");

  useEffect(() => {
    if (record) {
      setOkQty(record.okQty || 0);
      setNgQty(record.ngQty || 0);
      setRejectionReason(record.rejectionReason || REJECTION_REASONS[0]);
      setOperatorNotes(record.verificationNotes || "");
      setOperatorName(record.operatorName || "Rajesh Sharma (EMP-1042)");
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const totalAchieved = (Number(okQty) || 0) + (Number(ngQty) || 0);
  const planQty = record.planQty || 1;
  const progressPercent = Math.min(100, Math.round((totalAchieved / planQty) * 100));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(record, okQty, ngQty, rejectionReason, operatorNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E5E5EA] bg-[#F5F5F7]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF] text-white flex items-center justify-center shadow-xs">
              <Factory className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#1D1D1F] leading-tight">
                Operator Production Logging
              </h3>
              <p className="text-[11px] text-[#86868B]">
                Enter good output & NG defects for {record.workOrderNo} ({record.machineCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5EA] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick Context Card */}
          <div className="p-3 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA] text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#1D1D1F]">{record.customerName}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E8F2FE] text-[#007AFF] font-mono text-[10px] font-bold">
                {record.workOrderNo}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#6E6E73]">
              <span className="font-mono text-[#007AFF] font-medium">{record.childPartCode}</span>
              <span>•</span>
              <span className="truncate">{record.childPartName}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E5E5EA]/70">
              <span className="text-[#86868B]">Plan Target: <strong className="text-[#1D1D1F]">{record.planQty} pcs</strong></span>
              <span className="text-[#86868B]">Current Achieved: <strong className="text-[#34C759]">{totalAchieved} pcs ({progressPercent}%)</strong></span>
            </div>
          </div>

          {/* OK Qty (Good Output) and NG Qty (Rejections) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Good Output (OK) */}
            <div className="p-3 rounded-xl border-2 border-[#34C759]/40 bg-[#34C759]/5 space-y-2">
              <label className="block text-[11px] font-bold text-[#1E823B] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
                <span>Good Qty (OK)</span>
              </label>
              <PremiumNumberInput
                value={okQty}
                onChange={setOkQty}
                min={0}
                max={record.planQty * 2}
                suffix="pcs"
                className="w-full h-10 border-[#34C759]/40"
                inputClassName="text-base text-[#1E823B] font-bold"
              />
              <span className="text-[10px] text-[#86868B] block">
                Sound pieces passed operator visual check
              </span>
            </div>

            {/* Rejections (NG) */}
            <div className="p-3 rounded-xl border-2 border-[#FF3B30]/40 bg-[#FF3B30]/5 space-y-2">
              <label className="block text-[11px] font-bold text-[#DC2626] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FF3B30]" />
                <span>Rejected Qty (NG)</span>
              </label>
              <PremiumNumberInput
                value={ngQty}
                onChange={setNgQty}
                min={0}
                suffix="pcs"
                className="w-full h-10 border-[#FF3B30]/40"
                inputClassName="text-base text-[#DC2626] font-bold"
              />
              <span className="text-[10px] text-[#86868B] block">
                Defects quarantined for QC inspection
              </span>
            </div>
          </div>

          {/* Rejection Reason (Shown if NG > 0) */}
          {ngQty > 0 && (
            <div className="p-3 bg-[#FFF5F5] border border-[#FF3B30]/30 rounded-xl space-y-1.5 animate-in fade-in duration-100">
              <label className="block text-[11px] font-bold text-[#DC2626] uppercase tracking-wider">
                Rejection Root Cause Category
              </label>
              <PremiumDropdown
                value={rejectionReason}
                onChange={setRejectionReason}
                options={REJECTION_REASONS}
                size="md"
                placeholder="Select defect reason..."
              />
            </div>
          )}

          {/* Operator Name */}
          <div>
            <label className="block text-[11px] font-bold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>Operator Name & ID</span>
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full text-xs text-[#1D1D1F] bg-white border border-[#E5E5EA] rounded-lg px-3 py-2 focus:outline-none focus:border-[#007AFF]"
            />
          </div>

          {/* Operator Notes */}
          <div>
            <label className="block text-[11px] font-bold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#86868B]" />
              <span>Shift Remarks / Machine Observations</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Smooth bending run, slight mandrel oil residue wiped"
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              className="w-full text-xs text-[#1D1D1F] bg-white border border-[#E5E5EA] rounded-lg px-3 py-2 focus:outline-none focus:border-[#007AFF]"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#E5E5EA] flex items-center justify-between">
            <span className="text-[11px] text-[#86868B] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#007AFF]" />
              Requires Supervisor / QC confirmation after posting
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl border border-[#E5E5EA] text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Post Production Log</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
