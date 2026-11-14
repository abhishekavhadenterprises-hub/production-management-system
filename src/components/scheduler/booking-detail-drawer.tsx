import React, { useState, useEffect } from "react";
import {
  X,
  Play,
  Pause,
  CheckCircle,
  Scissors,
  XCircle,
  Calendar,
  Clock,
  Wrench,
  User,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { JobBooking, ReasonCode } from "@/lib/scheduler-types";
import { REASON_CODES } from "@/lib/scheduler-mock-data";
import { cn } from "@/lib/utils";
import { PremiumDropdown } from "@/components/ui/premium-dropdown";
import { PremiumNumberInput } from "@/components/ui/premium-number-input";

interface BookingDetailDrawerProps {
  booking: JobBooking | null;
  onClose: () => void;
  onUpdateBooking: (updated: JobBooking) => void;
  onSplitBooking: (booking: JobBooking, splitQty: number, reason: string) => void;
  onCancelBooking: (booking: JobBooking, reason: string) => void;
}

export function BookingDetailDrawer({
  booking,
  onClose,
  onUpdateBooking,
  onSplitBooking,
  onCancelBooking,
}: BookingDetailDrawerProps) {
  // Modal / View States
  const [activeTab, setActiveTab] = useState<"overview" | "setup" | "history">("overview");

  // Start Delay Recording State
  const [isRecordingStartDelay, setIsRecordingStartDelay] = useState(false);
  const [startDelayMinutes, setStartDelayMinutes] = useState<number>(20);
  const [startDelayReason, setStartDelayReason] = useState<string>(
    REASON_CODES.find((r) => r.category === "delay" && r.code === "DLY-05")?.label ||
    "Raw material unavailable / delayed from stores"
  );
  const [startDelayRemarks, setStartDelayRemarks] = useState<string>("");

  // Production Output Batch State
  const [isRecordingOutput, setIsRecordingOutput] = useState(false);
  const [goodQtyInput, setGoodQtyInput] = useState<number>(10);
  const [ngQtyInput, setNgQtyInput] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState<string>(
    REASON_CODES.find((r) => r.category === "rejection")?.label || ""
  );

  // Pause Downtime State
  const [isPausing, setIsPausing] = useState(false);
  const [pauseReason, setPauseReason] = useState<string>(
    REASON_CODES.find((r) => r.category === "delay")?.label || ""
  );

  // Split Order State
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitQty, setSplitQty] = useState<number>(30);
  const [splitReason, setSplitReason] = useState<string>(
    REASON_CODES.find((r) => r.category === "split" && r.code === "SPL-01")?.label ||
    "Raw material unavailable / partial stock shortage"
  );

  // Cancellation State
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>(
    REASON_CODES.find((r) => r.category === "cancel")?.label || ""
  );

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Reset internal states on booking switch
  useEffect(() => {
    if (booking) {
      setIsRecordingStartDelay(false);
      setIsRecordingOutput(false);
      setIsPausing(false);
      setIsSplitting(false);
      setIsCancelling(false);
      const remainingUnproduced = Math.max(1, booking.quantity - booking.producedGoodQty);
      setSplitQty(Math.max(1, Math.floor(remainingUnproduced / 2)));
    }
  }, [booking?.id]);

  if (!booking) return null;

  // Handlers
  const handleStartOnTime = () => {
    onUpdateBooking({
      ...booking,
      status: "running",
      actualStartTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  };

  const handleConfirmStartWithDelay = () => {
    onUpdateBooking({
      ...booking,
      status: "running",
      actualStartTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      startDelayMinutes: startDelayMinutes,
      startDelayReason: startDelayReason,
      startDelayRemarks: startDelayRemarks.trim() || undefined,
      startDelayRecordedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    setIsRecordingStartDelay(false);
  };

  const handlePauseConfirm = () => {
    onUpdateBooking({
      ...booking,
      status: "paused",
      pauseReason: pauseReason,
      pauseDurationMinutes: (booking.pauseDurationMinutes || 0) + 15,
    });
    setIsPausing(false);
  };

  const handleResume = () => {
    onUpdateBooking({
      ...booking,
      status: "running",
    });
  };

  const handleRecordOutputConfirm = () => {
    const newGood = booking.producedGoodQty + goodQtyInput;
    const newNg = booking.producedNgQty + ngQtyInput;
    const newProgress = Math.min(100, Math.round((newGood / booking.quantity) * 100));

    onUpdateBooking({
      ...booking,
      producedGoodQty: newGood,
      producedNgQty: newNg,
      progressPercent: newProgress,
      status: newGood >= booking.quantity ? "completed" : booking.status,
    });
    setIsRecordingOutput(false);
    setGoodQtyInput(10);
    setNgQtyInput(0);
  };

  const handleComplete = () => {
    onUpdateBooking({
      ...booking,
      status: "completed",
      progressPercent: 100,
      actualEndTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      virtualBoxStage: "VB2",
    });
  };

  const handleSplitConfirm = () => {
    onSplitBooking(booking, splitQty, splitReason);
    setIsSplitting(false);
  };

  const handleCancelConfirm = () => {
    onCancelBooking(booking, cancelReason);
    setIsCancelling(false);
  };

  const remainingQty = Math.max(0, booking.quantity - booking.producedGoodQty);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#E5E5EA] shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Apple Style Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5EA] bg-[#FBFBFC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-tight">
              {booking.machineCode.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base text-[#1D1D1F] tracking-tight">
                  {booking.woNumber}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    booking.status === "running"
                      ? "bg-[#EAF8EF] text-[#1E823B] border border-[#C3EED3]"
                      : booking.status === "paused"
                      ? "bg-[#FFF6E9] text-[#A65F00] border border-[#FDE0B6]"
                      : booking.status === "completed"
                      ? "bg-[#E8F2FE] text-[#007AFF] border border-[#B2D7FD]"
                      : "bg-[#F2F2F7] text-[#6E6E73] border border-[#E5E5EA]"
                  )}
                >
                  {booking.status}
                </span>
                {booking.startDelayReason && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF6E9] text-[#A65F00] border border-[#FDE0B6] flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Delayed (+{booking.startDelayMinutes}m)</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E6E73] truncate mt-0.5">
                {booking.customer}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#6E6E73] hover:text-[#1D1D1F] flex items-center justify-center transition-colors shadow-2xs"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar text-xs">
          {/* Start Delay Prominent Notice if present */}
          {booking.startDelayReason && (
            <div className="p-3.5 rounded-xl bg-[#FFF6E9] border border-[#FDE0B6] flex items-start gap-2.5 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-[#FF9500]/10 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-[#FF9500]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-semibold text-xs text-[#A65F00]">
                    Delayed Start (+{booking.startDelayMinutes || 0} minutes)
                  </span>
                  {booking.startDelayRecordedAt && (
                    <span className="text-[10px] text-[#86868B] font-mono">
                      Logged at {booking.startDelayRecordedAt}
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] font-medium text-[#1D1D1F] mt-1">
                  Reason: <span className="font-semibold">{booking.startDelayReason}</span>
                </div>
                {booking.startDelayRemarks && (
                  <div className="text-[11px] text-[#6E6E73] mt-1 bg-white/70 p-1.5 rounded-lg border border-[#FDE0B6]/60">
                    Remarks: &ldquo;{booking.startDelayRemarks}&rdquo;
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Component & Assignment Card */}
          <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E5E5EA] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="font-mono font-bold text-xs text-[#007AFF]">
                  {booking.componentCode}
                </span>
                <h4 className="text-sm font-semibold text-[#1D1D1F] leading-tight mt-0.5">
                  {booking.componentName}
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10.5px] font-medium bg-white border border-[#E5E5EA] text-[#48484A] shrink-0">
                {booking.operation}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#E5E5EA]/80 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-[#E5E5EA]">
                <span className="text-[#86868B] block text-[9.5px]">Machine</span>
                <strong className="text-[#1D1D1F] font-semibold">{booking.machineCode}</strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#E5E5EA]">
                <span className="text-[#86868B] block text-[9.5px]">Operator</span>
                <strong className="text-[#1D1D1F] font-semibold truncate block">
                  {booking.operatorName}
                </strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#E5E5EA]">
                <span className="text-[#86868B] block text-[9.5px]">Planned Slot</span>
                <strong className="text-[#1D1D1F] font-mono text-[10.5px] block">
                  {booking.startTime}–{booking.endTime}
                </strong>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#E5E5EA]">
                <span className="text-[#86868B] block text-[9.5px]">Actual Start</span>
                <strong className="text-[#1D1D1F] font-mono text-[10.5px] block">
                  {booking.actualStartTime || "Pending"}
                </strong>
              </div>
            </div>
          </div>

          {/* Output Progress Card */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E5E5EA] space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#1D1D1F]">
                Production Output Progress
              </span>
              <span className="font-mono font-bold text-xs text-[#007AFF]">
                {booking.progressPercent}% Completed
              </span>
            </div>

            <div className="w-full bg-[#E5E5EA] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#34C759] h-full rounded-full transition-all duration-300"
                style={{ width: `${booking.progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 text-center pt-1 font-mono">
              <div className="p-2 rounded-lg bg-[#F8F9FA] border border-[#E5E5EA]">
                <div className="text-[9px] font-sans text-[#86868B]">Target</div>
                <div className="font-bold text-xs text-[#1D1D1F]">{booking.quantity}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#F8F9FA] border border-[#E5E5EA]">
                <div className="text-[9px] font-sans text-[#86868B]">Good Output</div>
                <div className="font-bold text-xs text-[#34C759]">{booking.producedGoodQty}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#F8F9FA] border border-[#E5E5EA]">
                <div className="text-[9px] font-sans text-[#86868B]">NG Rejects</div>
                <div className="font-bold text-xs text-[#FF3B30]">{booking.producedNgQty}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#F8F9FA] border border-[#E5E5EA]">
                <div className="text-[9px] font-sans text-[#86868B]">Remaining</div>
                <div className="font-bold text-xs text-[#FF9500]">{remainingQty}</div>
              </div>
            </div>
          </div>

          {/* Time & Setup Breakdown */}
          <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E5EA] space-y-1.5 text-[11px]">
            <div className="font-semibold text-xs text-[#1D1D1F] mb-1">
              Setup & Operational Tracking
            </div>
            <div className="flex items-center justify-between text-[#6E6E73]">
              <span>Tooling Die Setup:</span>
              <span className="font-mono">{booking.toolSetupMinutes} mins ({booking.toolName})</span>
            </div>
            <div className="flex items-center justify-between text-[#6E6E73]">
              <span>Program Setup & Calibration:</span>
              <span className="font-mono">{booking.programSetupMinutes} mins</span>
            </div>
            <div className="flex items-center justify-between text-[#6E6E73]">
              <span>QC Sample Inspection:</span>
              <span className="font-mono">{booking.sampleSetupMinutes} mins</span>
            </div>
            {booking.pauseDurationMinutes && (
              <div className="flex items-center justify-between text-[#B45309] font-medium pt-1 border-t border-[#E5E5EA]">
                <span>Logged Downtime:</span>
                <span className="font-mono">
                  {booking.pauseDurationMinutes} mins ({booking.pauseReason})
                </span>
              </div>
            )}
          </div>

          {/* DYNAMIC ACTION MODALS / INLINES */}

          {/* 1. Record Why Production Did Not Start On Time */}
          {isRecordingStartDelay && (
            <div className="p-4 rounded-xl bg-[#FFF6E9] border border-[#FDE0B6] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#A65F00]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Record Production Start Delay Reason</span>
                </div>
                <button
                  onClick={() => setIsRecordingStartDelay(false)}
                  className="text-[#86868B] hover:text-[#1D1D1F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-medium text-[#6E6E73] block mb-1">
                  Delay Reason Code
                </label>
                <PremiumDropdown
                  value={startDelayReason}
                  onChange={setStartDelayReason}
                  options={REASON_CODES.filter((r) => r.category === "delay").map((r) => ({
                    value: r.label,
                    label: `${r.code} – ${r.label}`,
                  }))}
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-[#6E6E73] block mb-1">
                    Delay Duration (Minutes)
                  </label>
                  <PremiumNumberInput
                    min={1}
                    max={480}
                    value={startDelayMinutes}
                    onChange={setStartDelayMinutes}
                    suffix="m"
                    size="sm"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#6E6E73] block mb-1">
                    Supervisor Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Waiting for batch transfer"
                    value={startDelayRemarks}
                    onChange={(e) => setStartDelayRemarks(e.target.value)}
                    className="w-full p-1.5 bg-white border border-[#E5E5EA] rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmStartWithDelay}
                className="w-full py-2 bg-[#FF9500] hover:bg-[#E08500] text-white font-semibold rounded-xl shadow-xs transition-colors"
              >
                Save Delay Reason & Start Production
              </button>
            </div>
          )}

          {/* 2. Split Work Order (Material Unavailable or Customer Reduced Qty) */}
          {isSplitting && (
            <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#1D4ED8]">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Split Work Order (Material or Customer Request)</span>
                </div>
                <button
                  onClick={() => setIsSplitting(false)}
                  className="text-[#86868B] hover:text-[#1D1D1F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-[#48484A]">
                Split this job into a child order when raw material is partially unavailable or the customer requires a smaller batch dispatch.
              </p>

              <div>
                <label className="text-[10px] font-medium text-[#6E6E73] block mb-1">
                  Reason for Work Split
                </label>
                <PremiumDropdown
                  value={splitReason}
                  onChange={setSplitReason}
                  options={REASON_CODES.filter((r) => r.category === "split").map((r) => ({
                    value: r.label,
                    label: `${r.code} – ${r.label}`,
                  }))}
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-[#6E6E73] block mb-1">
                    Quantity to Split to Child WO
                  </label>
                  <PremiumNumberInput
                    min={1}
                    max={remainingQty - 1 || 1}
                    value={splitQty}
                    onChange={setSplitQty}
                    suffix="pcs"
                    size="sm"
                    className="w-full"
                    inputClassName="text-[#007AFF] font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#6E6E73] block mb-1">
                    Retained on Current Machine
                  </label>
                  <div className="p-1.5 bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg text-xs font-mono font-bold text-[#1D1D1F]">
                    {Math.max(0, booking.quantity - splitQty)} pcs
                  </div>
                </div>
              </div>

              <button
                onClick={handleSplitConfirm}
                className="w-full py-2 bg-[#007AFF] hover:bg-[#0058B3] text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Confirm Split & Create Child Work Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 3. Record Production Output Batch */}
          {isRecordingOutput && (
            <div className="p-4 rounded-xl bg-[#EAF8EF] border border-[#C3EED3] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#1E823B]">
                  Record Completed Batch Pieces
                </span>
                <button
                  onClick={() => setIsRecordingOutput(false)}
                  className="text-[#86868B] hover:text-[#1D1D1F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#6E6E73] block mb-1">
                    Good Accepted Pieces
                  </label>
                  <PremiumNumberInput
                    min={0}
                    value={goodQtyInput}
                    onChange={setGoodQtyInput}
                    suffix="pcs"
                    size="sm"
                    className="w-full"
                    inputClassName="text-[#34C759] font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6E6E73] block mb-1">
                    NG Scrap Pieces
                  </label>
                  <PremiumNumberInput
                    min={0}
                    value={ngQtyInput}
                    onChange={setNgQtyInput}
                    suffix="pcs"
                    size="sm"
                    className="w-full"
                    inputClassName="text-[#FF3B30] font-bold"
                  />
                </div>
              </div>

              {ngQtyInput > 0 && (
                <div>
                  <label className="text-[10px] text-[#6E6E73] block mb-1">
                    Rejection Defect Reason
                  </label>
                  <PremiumDropdown
                    value={rejectionReason}
                    onChange={setRejectionReason}
                    options={REASON_CODES.filter((r) => r.category === "rejection").map((r) => ({
                      value: r.label,
                      label: `${r.code} – ${r.label}`,
                    }))}
                    size="sm"
                  />
                </div>
              )}

              <button
                onClick={handleRecordOutputConfirm}
                className="w-full py-2 bg-[#34C759] hover:bg-[#2DB04D] text-white font-semibold rounded-xl shadow-xs transition-colors"
              >
                Save Production Batch Output
              </button>
            </div>
          )}

          {/* 4. Pause Downtime */}
          {isPausing && (
            <div className="p-4 rounded-xl bg-[#FFF6E9] border border-[#FDE0B6] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#A65F00]">
                  Pause Production & Log Downtime Reason
                </span>
                <button
                  onClick={() => setIsPausing(false)}
                  className="text-[#86868B] hover:text-[#1D1D1F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="text-[10px] text-[#6E6E73] block mb-1">
                  Delay / Stoppage Reason
                </label>
                <PremiumDropdown
                  value={pauseReason}
                  onChange={setPauseReason}
                  options={REASON_CODES.filter((r) => r.category === "delay").map((r) => ({
                    value: r.label,
                    label: `${r.code} – ${r.label}`,
                  }))}
                  size="sm"
                />
              </div>

              <button
                onClick={handlePauseConfirm}
                className="w-full py-2 bg-[#FF9500] hover:bg-[#E08500] text-white font-semibold rounded-xl shadow-xs transition-colors"
              >
                Confirm Job Pause
              </button>
            </div>
          )}

          {/* 5. Cancel Booking */}
          {isCancelling && (
            <div className="p-4 rounded-xl bg-[#FFEBEA] border border-[#FDCAC7] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#B82218]">
                  Cancel Scheduled Order
                </span>
                <button
                  onClick={() => setIsCancelling(false)}
                  className="text-[#86868B] hover:text-[#1D1D1F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="text-[10px] text-[#6E6E73] block mb-1">
                  Cancellation Reason Code
                </label>
                <PremiumDropdown
                  value={cancelReason}
                  onChange={setCancelReason}
                  options={REASON_CODES.filter((r) => r.category === "cancel").map((r) => ({
                    value: r.label,
                    label: `${r.code} – ${r.label}`,
                  }))}
                  size="sm"
                />
              </div>

              <button
                onClick={handleCancelConfirm}
                className="w-full py-2 bg-[#FF3B30] hover:bg-[#D72A20] text-white font-semibold rounded-xl shadow-xs transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Action Controls */}
        <div className="p-4 sm:p-5 border-t border-[#E5E5EA] bg-[#FBFBFC] space-y-2.5 shrink-0">
          <div className="flex items-center gap-2">
            {booking.status === "scheduled" && (
              <>
                <button
                  onClick={handleStartOnTime}
                  className="flex-1 py-2.5 bg-[#34C759] hover:bg-[#2DB04D] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start (On Time)</span>
                </button>

                <button
                  onClick={() => setIsRecordingStartDelay(true)}
                  className="px-3.5 py-2.5 bg-[#FFF6E9] hover:bg-[#FFE8CC] text-[#A65F00] border border-[#FDE0B6] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  title="Record delay reason before starting"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Record Start Delay</span>
                </button>
              </>
            )}

            {booking.status === "running" && (
              <>
                <button
                  onClick={() => setIsRecordingOutput(true)}
                  className="flex-1 py-2.5 bg-[#34C759] hover:bg-[#2DB04D] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Record Batch</span>
                </button>

                <button
                  onClick={() => setIsPausing(true)}
                  className="px-3 py-2.5 bg-[#FF9500] hover:bg-[#E08500] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>

                <button
                  onClick={handleComplete}
                  className="px-3.5 py-2.5 bg-[#007AFF] hover:bg-[#0058B3] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Complete
                </button>
              </>
            )}

            {booking.status === "paused" && (
              <>
                <button
                  onClick={handleResume}
                  className="flex-1 py-2.5 bg-[#34C759] hover:bg-[#2DB04D] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Production</span>
                </button>

                <button
                  onClick={() => setIsRecordingOutput(true)}
                  className="px-3.5 py-2.5 bg-white border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[#1D1D1F] font-semibold text-xs rounded-xl transition-colors"
                >
                  Output
                </button>
              </>
            )}
          </div>

          {/* Secondary Options: Split Work Order & Cancel */}
          <div className="flex items-center gap-2 pt-1 border-t border-[#E5E5EA]">
            <button
              onClick={() => setIsSplitting(true)}
              className="flex-1 py-1.5 bg-white border border-[#E5E5EA] hover:border-[#007AFF] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Scissors className="w-3 h-3 text-[#007AFF]" />
              <span>Split Work Order</span>
            </button>

            <button
              onClick={() => setIsCancelling(true)}
              className="flex-1 py-1.5 bg-white border border-[#E5E5EA] hover:border-[#FF3B30] hover:text-[#FF3B30] text-[#86868B] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3 h-3 text-[#FF3B30]" />
              <span>Cancel Booking</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
