import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  UserCheck,
  Clock,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";
import { ProductionRecord } from "@/lib/production-types";
import { SUPERVISOR_ROLES } from "@/lib/production-mock-data";
import { PremiumDropdown } from "@/components/ui/premium-dropdown";
import { PremiumCheckbox } from "@/components/ui/premium-switch";

interface SupervisorConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ProductionRecord | null;
  onConfirm: (
    record: ProductionRecord,
    role: string,
    verifierName: string,
    notes: string,
    action: "approve" | "reject"
  ) => void;
}

export function SupervisorConfirmModal({
  isOpen,
  onClose,
  record,
  onConfirm,
}: SupervisorConfirmModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>(SUPERVISOR_ROLES[0]);
  const [verifierName, setVerifierName] = useState<string>("Vikram Malhotra (QC-109)");
  const [check1, setCheck1] = useState(true);
  const [check2, setCheck2] = useState(true);
  const [check3, setCheck3] = useState(true);
  const [notes, setNotes] = useState("");

  if (!isOpen || !record) return null;

  const handleApprove = () => {
    onConfirm(record, selectedRole, verifierName, notes, "approve");
    onClose();
  };

  const handleReject = () => {
    onConfirm(record, selectedRole, verifierName, notes, "reject");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E5E5EA] bg-[#F5F5F7]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#34C759] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#1D1D1F] leading-tight">
                Responsible Person Output Verification
              </h3>
              <p className="text-[11px] text-[#86868B]">
                Role confirmation & approval of operator reported counts
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

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {/* Summary Box */}
          <div className="p-3.5 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA] space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-[#1D1D1F] text-[13px]">{record.workOrderNo}</span>
                <span className="text-[#86868B] ml-2">({record.customerName})</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white border border-[#E5E5EA] font-mono text-[10.5px] font-semibold text-[#007AFF]">
                {record.machineCode}
              </span>
            </div>

            <div className="text-[11.5px] text-[#6E6E73] flex items-center gap-2">
              <span className="font-mono text-[#007AFF] font-medium">{record.childPartCode}</span>
              <span>•</span>
              <span className="truncate">{record.childPartName}</span>
            </div>

            {/* Operator Reported Numbers */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E5EA] text-center">
              <div className="p-2 rounded-lg bg-white border border-[#E5E5EA]">
                <div className="text-[9.5px] text-[#86868B] uppercase font-semibold">Plan Target</div>
                <div className="text-base font-bold font-mono text-[#1D1D1F]">{record.planQty}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#EAF8EF] border border-[#34C759]/30">
                <div className="text-[9.5px] text-[#1E823B] uppercase font-semibold">Reported Good (OK)</div>
                <div className="text-base font-bold font-mono text-[#1E823B]">{record.okQty}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#FFF5F5] border border-[#FF3B30]/30">
                <div className="text-[9.5px] text-[#DC2626] uppercase font-semibold">Reported NG (Rejects)</div>
                <div className="text-base font-bold font-mono text-[#DC2626]">{record.ngQty}</div>
              </div>
            </div>

            {record.ngQty > 0 && record.rejectionReason && (
              <div className="text-[11px] text-[#DC2626] bg-[#FFF5F5] p-2 rounded-lg border border-[#FF3B30]/20 flex items-start gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#FF3B30]" />
                <span>
                  <strong>Reported Defect:</strong> {record.rejectionReason}
                </span>
              </div>
            )}
          </div>

          {/* Role Confirmation Section */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Responsible Person Role Confirmation</span>
              </label>
              <PremiumDropdown
                value={selectedRole}
                onChange={setSelectedRole}
                options={SUPERVISOR_ROLES}
                size="md"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Verifier Full Name & Staff ID</span>
              </label>
              <input
                type="text"
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                placeholder="e.g. Vikram Malhotra (QC-109)"
                className="w-full text-xs text-[#1D1D1F] bg-white border border-[#E5E5EA] rounded-xl px-3 py-2 focus:outline-none focus:border-[#007AFF]"
              />
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="p-3.5 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA] space-y-2.5">
            <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              Verification Checklist
            </div>
            <PremiumCheckbox
              checked={check1}
              onChange={setCheck1}
              label="Sample dimensional tolerance & bend angle verified with gauge"
            />
            <PremiumCheckbox
              checked={check2}
              onChange={setCheck2}
              label="Rejection pieces counted and quarantined to marked red bin"
            />
            <PremiumCheckbox
              checked={check3}
              onChange={setCheck3}
              label={
                <span>
                  Approved for downstream move to <strong>{record.process}</strong>
                </span>
              }
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-[#86868B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#86868B]" />
              <span>Inspection Remarks (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. First piece & final sample inspected. Passed hydro tolerance."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs text-[#1D1D1F] bg-white border border-[#E5E5EA] rounded-xl px-3 py-2 focus:outline-none focus:border-[#007AFF]"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#E5E5EA] flex items-center justify-between">
            <button
              type="button"
              onClick={handleReject}
              className="px-3 py-2 rounded-xl border border-[#FF3B30]/30 hover:border-[#FF3B30] text-[#FF3B30] hover:bg-[#FFF5F5] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Flag for Recount</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl border border-[#E5E5EA] text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!check1 || !check2 || !check3}
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl bg-[#34C759] hover:bg-[#2DB34D] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Approve Output</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
