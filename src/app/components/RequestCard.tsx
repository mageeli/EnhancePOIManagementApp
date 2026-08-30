import { MapPin, Clock, AlertCircle, ChevronLeft } from "lucide-react";
import type { POIRequest } from "./data";
import { statusLabels, statusColors, sourceLabels, sourceColors, requestTypeLabels } from "./data";

interface RequestCardProps {
  request: POIRequest;
  onReview: (request: POIRequest) => void;
  selected?: boolean;
}

function SLAIndicator({ hours, remaining }: { hours: number; remaining: number }) {
  const pct = (remaining / hours) * 100;
  const isUrgent = pct < 25;
  const isWarning = pct < 50;
  const color = isUrgent ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400';
  const barColor = isUrgent ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="flex items-center gap-1.5">
      <Clock className={`w-3 h-3 ${color}`} />
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden w-16">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs ${color} tabular-nums`}>{remaining}س</span>
    </div>
  );
}

export function RequestCard({ request, onReview, selected }: RequestCardProps) {
  const isCancellation = request.type === 'cancel-license';

  return (
    <div
      className={`rounded-lg border transition-all cursor-pointer group ${
        selected
          ? 'border-blue-500/60 bg-blue-600/10'
          : 'border-white/8 bg-[#1e2533]/60 hover:border-white/15 hover:bg-[#1e2533]'
      }`}
    >
      <div className="p-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-sm font-medium text-white truncate">{request.poiName}</span>
              {isCancellation && (
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              )}
            </div>
            <span className="text-xs text-white/40 font-mono">{request.requestId}</span>
          </div>
          <div className={`text-xs px-2 py-0.5 rounded border shrink-0 ${statusColors[request.status]}`}>
            {statusLabels[request.status]}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span className={`text-xs px-1.5 py-0.5 rounded border ${sourceColors[request.source]}`}>
            {sourceLabels[request.source]}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded border border-white/10 text-white/50 bg-white/5">
            {requestTypeLabels[request.type]}
          </span>
          {request.priority === 'high' && (
            <span className="text-xs px-1.5 py-0.5 rounded border border-red-500/30 text-red-400 bg-red-500/10">
              أولوية عالية
            </span>
          )}
        </div>

        {/* Location */}
        <div className="text-xs text-white/40 mb-2">
          {request.city} · {request.district}
          {request.licenseNumber && (
            <span className="mr-2 text-white/30">رخصة: {request.licenseNumber}</span>
          )}
        </div>

        {/* SLA + Date */}
        <div className="flex items-center justify-between">
          <SLAIndicator hours={request.slaHours} remaining={request.slaRemaining} />
          <span className="text-xs text-white/30">
            {new Date(request.submittedAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-white/6 px-3 py-2 flex justify-end">
        <button
          onClick={(e) => { e.stopPropagation(); onReview(request); }}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          مراجعة
          <ChevronLeft className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
