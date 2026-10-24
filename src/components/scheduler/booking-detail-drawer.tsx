import React, { useState } from "react";
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
  FileSpreadsheet,
  Cpu,
  Info,
} from "lucide-react";
import { JobBooking, ReasonCode } from "@/lib/scheduler-types";
import { REASON_CODES } from "@/lib/scheduler-mock-data";
import { cn } from "@/lib/utils";

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
  // Action modal states within drawer
  const [isRecordingOutput, setIsRecordingOutput] = useState(false);
  const [goodQtyInput, setGoodQtyInput] = useState<number>(10);
  const [ngQtyInput, setNgQtyInput] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState<string>(
    REASON_CODES.find((r) => r.category === "rejection")?.label || ""
  );

  const [isPausing, setIsPausing] = useState(false);
  const [pauseReason, setPauseReason] = useState<string>(
    REASON_CODES.find((r) => r.category === "delay")?.label || ""
  );

  const [isSplitting, setIsSplitting] = useState(false);
  const [splitQty, setSplitQty] = useState<number>(30);
  const [splitReason, setSplitReason] = useState<string>(
    REASON_CODES.find((r) => r.category === "split")?.label || ""
  );

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>(
    REASON_CODES.find((r) => r.category === "cancel")?.label || ""
  );

  if (!booking) return null;

  // Action handlers
  const handleStart = () => {
    onUpdateBooking({
      ...booking,
      status: "running",
      actualStartTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
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
      virtualBoxStage: "VB2", // Advanced to next WIP buffer box!
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

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white border-l border-[#E5E5EA] shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E5EA] bg-[#F8F9FA] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {booking.machineCode.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[#1D1D1F]">
                {booking.woNumber}
              </span>
              <span
                className={cn(
                  "text-[9px] font-bold px-1.5 py-0.2 rounded uppercase",
                  booking.status === "running"
                    ? "bg-[#EAF8EF] text-[#1E823B]"
                    : booking.status === "paused"
                    ? "bg-[#FFF6E9] text-[#A65F00]"
                    : booking.status === "completed"
                    ? "bg-[#E8F2FE] text-[#007AFF]"
                    : "bg-[#F2F2F7] text-[#6E6E73]"
                )}
              >
                {booking.status.toUpperCase()}
              </span>
            </div>
            <p className="text-[10.5px] text-[#86868B] truncate mt-0.5">
              {booking.customer}
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

      {/* Honesty Disclosure Banner */}
      <div className="px-4 py-2 bg-[#F5F5F7] border-b border-[#E5E5EA] text-[10px] text-[#6E6E73] flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-[#007AFF]" />
          <span>Execution Simulation Mode (PLC offline)</span>
        </span>
        <span className="font-mono font-semibold text-[#007AFF]">
          Stage: {booking.virtualBoxStage}
        </span>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        {/* Component & Machine Details */}
        <div className="p-3 rounded-xl bg-white border border-[#E5E5EA] space-y-2 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold text-[#007AFF]">
                {booking.componentCode}
              </div>
              <div className="text-xs font-semibold text-[#1D1D1F] mt-0.5">
                {booking.componentName}
              </div>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#F2F2F7] text-[#6E6E73]">
              {booking.operation}
            </span>
          </div>

          <div className="pt-2 border-t border-[#F2F2F7] grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#86868B] block text-[10px]">Machine</span>
              <strong className="text-[#1D1D1F]">{booking.machineCode}</strong>
            </div>
            <div>
              <span className="text-[#86868B] block text-[10px]">Operator</span>
              <strong className="text-[#1D1D1F] truncate block">{booking.operatorName}</strong>
            </div>
            <div>
              <span className="text-[#86868B] block text-[10px]">Time Slot</span>
              <strong className="text-[#1D1D1F] font-mono">{booking.startTime} – {booking.endTime}</strong>
            </div>
            <div>
              <span className="text-[#86868B] block text-[10px]">Tooling Die</span>
              <strong className="text-[#1D1D1F] truncate block">{booking.toolName}</strong>
            </div>
          </div>
        </div>

        {/* Output Progress Box */}
        <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E5E5EA] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#1D1D1F]">
              Production Output Progress
            </span>
            <span className="font-mono font-bold text-xs text-[#007AFF]">
              {booking.progressPercent}%
            </span>
          </div>

          <div className="w-full bg-[#E5E5EA] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#34C759] h-full rounded-full transition-all duration-300"
              style={{ width: `${booking.progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
            <div className="p-1.5 rounded bg-white border border-[#E5E5EA]">
              <div className="text-[9px] font-sans text-[#86868B]">Target</div>
              <div className="font-bold text-xs text-[#1D1D1F]">{booking.quantity}</div>
            </div>
            <div className="p-1.5 rounded bg-white border border-[#E5E5EA]">
              <div className="text-[9px] font-sans text-[#86868B]">Good Output</div>
              <div className="font-bold text-xs text-[#34C759]">{booking.producedGoodQty}</div>
            </div>
            <div className="p-1.5 rounded bg-white border border-[#E5E5EA]">
              <div className="text-[9px] font-sans text-[#86868B]">NG Rejects</div>
              <div className="font-bold text-xs text-[#FF3B30]">{booking.producedNgQty}</div>
            </div>
          </div>
        </div>

        {/* Setup & Time Breakdown */}
        <div className="p-3 rounded-xl bg-white border border-[#E5E5EA] space-y-1.5 text-[11px]">
          <div className="font-bold text-xs text-[#1D1D1F] mb-1">
            Time & Setup Tracking
          </div>
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span>Tool Setup:</span>
            <span className="font-mono">{booking.toolSetupMinutes} mins</span>
          </div>
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span>Program Setup:</span>
            <span className="font-mono">{booking.programSetupMinutes} mins</span>
          </div>
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span>Sample Inspection:</span>
            <span className="font-mono">{booking.sampleSetupMinutes} mins</span>
          </div>
          {booking.pauseDurationMinutes && (
            <div className="flex items-center justify-between text-[#B45309] font-medium pt-1 border-t border-[#F2F2F7]">
              <span>Recorded Downtime:</span>
              <span className="font-mono">{booking.pauseDurationMinutes} mins ({booking.pauseReason})</span>
            </div>
          )}
        </div>

        {/* Dynamic Action Inlines (Record Output, Pause, Split, Cancel) */}
        {isRecordingOutput && (
          <div className="p-3 rounded-xl bg-[#EAF8EF] border border-[#C3EED3] space-y-2 text-xs">
            <div className="font-bold text-[#1E823B] flex items-center justify-between">
              <span>Record Machine Production Batch</span>
              <button onClick={() => setIsRecordingOutput(false)} className="text-[#86868B]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#6E6E73] block mb-0.5">Good Pieces</label>
                <input
                  type="number"
                  min="0"
                  value={goodQtyInput}
                  onChange={(e) => setGoodQtyInput(Number(e.target.value))}
                  className="w-full p-1 bg-white border rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#6E6E73] block mb-0.5">NG Scrap Pieces</label>
                <input
                  type="number"
                  min="0"
                  value={ngQtyInput}
                  onChange={(e) => setNgQtyInput(Number(e.target.value))}
                  className="w-full p-1 bg-white border rounded text-xs font-mono"
                />
              </div>
            </div>
            {ngQtyInput > 0 && (
              <div>
                <label className="text-[10px] text-[#6E6E73] block mb-0.5">Rejection Reason Code</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-1 bg-white border rounded text-xs"
                >
                  {REASON_CODES.filter((r) => r.category === "rejection").map((r) => (
                    <option key={r.id} value={r.label}>
                      {r.code} - {r.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={handleRecordOutputConfirm}
              className="w-full py-1.5 bg-[#34C759] text-white font-semibold rounded-lg shadow-xs hover:bg-[#2DB04D]"
            >
              Save Production Output
            </button>
          </div>
        )}

        {isPausing && (
          <div className="p-3 rounded-xl bg-[#FFF6E9] border border-[#FDE0B6] space-y-2 text-xs">
            <div className="font-bold text-[#A65F00] flex items-center justify-between">
              <span>Pause Job & Record Delay Reason</span>
              <button onClick={() => setIsPausing(false)} className="text-[#86868B]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <select
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              className="w-full p-1.5 bg-white border rounded text-xs"
            >
              {REASON_CODES.filter((r) => r.category === "delay").map((r) => (
                <option key={r.id} value={r.label}>
                  {r.code} - {r.label}
                </option>
              ))}
            </select>
            <button
              onClick={handlePauseConfirm}
              className="w-full py-1.5 bg-[#FF9500] text-white font-semibold rounded-lg shadow-xs hover:bg-[#E08500]"
            >
              Confirm Pause
            </button>
          </div>
        )}

        {isSplitting && (
          <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-2 text-xs">
            <div className="font-bold text-[#1D4ED8] flex items-center justify-between">
              <span>Split Outstanding Work Order</span>
              <button onClick={() => setIsSplitting(false)} className="text-[#86868B]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <label className="text-[10px] text-[#6E6E73] block mb-0.5">Quantity to Split to Child</label>
              <input
                type="number"
                min="1"
                max={booking.quantity - booking.producedGoodQty}
                value={splitQty}
                onChange={(e) => setSplitQty(Number(e.target.value))}
                className="w-full p-1 bg-white border rounded text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#6E6E73] block mb-0.5">Reason for Split</label>
              <select
                value={splitReason}
                onChange={(e) => setSplitReason(e.target.value)}
                className="w-full p-1 bg-white border rounded text-xs"
              >
                {REASON_CODES.filter((r) => r.category === "split").map((r) => (
                  <option key={r.id} value={r.label}>
                    {r.code} - {r.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSplitConfirm}
              className="w-full py-1.5 bg-[#007AFF] text-white font-semibold rounded-lg shadow-xs hover:bg-[#0058B3]"
            >
              Create Split Work Order
            </button>
          </div>
        )}

        {isCancelling && (
          <div className="p-3 rounded-xl bg-[#FFEBEA] border border-[#FDCAC7] space-y-2 text-xs">
            <div className="font-bold text-[#B82218] flex items-center justify-between">
              <span>Cancel Work Order Booking</span>
              <button onClick={() => setIsCancelling(false)} className="text-[#86868B]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <label className="text-[10px] text-[#6E6E73] block mb-0.5">Cancellation Reason Code</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-1 bg-white border rounded text-xs"
              >
                {REASON_CODES.filter((r) => r.category === "cancel").map((r) => (
                  <option key={r.id} value={r.label}>
                    {r.code} - {r.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCancelConfirm}
              className="w-full py-1.5 bg-[#FF3B30] text-white font-semibold rounded-lg shadow-xs hover:bg-[#D72A20]"
            >
              Confirm Cancellation
            </button>
          </div>
        )}
      </div>

      {/* Drawer Action Bar */}
      <div className="p-4 border-t border-[#E5E5EA] bg-[#F8F9FA] space-y-2">
        <div className="flex items-center gap-2">
          {booking.status === "scheduled" && (
            <button
              onClick={handleStart}
              className="flex-1 py-2 bg-[#34C759] text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-[#2DB04D] flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Job</span>
            </button>
          )}

          {booking.status === "running" && (
            <>
              <button
                onClick={() => setIsRecordingOutput(true)}
                className="flex-1 py-2 bg-[#34C759] text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-[#2DB04D] flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Record Output</span>
              </button>

              <button
                onClick={() => setIsPausing(true)}
                className="px-3 py-2 bg-[#FF9500] text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-[#E08500] flex items-center justify-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>

              <button
                onClick={handleComplete}
                className="px-3 py-2 bg-[#007AFF] text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-[#0058B3] flex items-center justify-center"
                title="Complete Job & Move to next WIP stage"
              >
                Complete
              </button>
            </>
          )}

          {booking.status === "paused" && (
            <>
              <button
                onClick={handleResume}
                className="flex-1 py-2 bg-[#34C759] text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-[#2DB04D] flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume Job</span>
              </button>

              <button
                onClick={() => setIsRecordingOutput(true)}
                className="px-3 py-2 bg-white border border-[#E5E5EA] text-[#1D1D1F] font-semibold text-xs rounded-xl hover:bg-[#F5F5F7]"
              >
                Output
              </button>
            </>
          )}
        </div>

        {/* Secondary actions: Split & Cancel */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#E5E5EA]/60">
          <button
            onClick={() => setIsSplitting(true)}
            className="flex-1 py-1.5 bg-white border border-[#E5E5EA] hover:border-[#007AFF] text-[#1D1D1F] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5"
          >
            <Scissors className="w-3 h-3 text-[#007AFF]" />
            <span>Split Order</span>
          </button>

          <button
            onClick={() => setIsCancelling(true)}
            className="flex-1 py-1.5 bg-white border border-[#E5E5EA] hover:border-[#FF3B30] hover:text-[#FF3B30] text-[#86868B] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-3 h-3 text-[#FF3B30]" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
