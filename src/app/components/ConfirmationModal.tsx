import { CheckCircle, AlertTriangle, MapPin, X, ArrowLeft } from "lucide-react";
import type { POIRequest } from "./data";
import { sourceLabels, requestTypeLabels } from "./data";

interface ConfirmationModalProps {
  request: POIRequest;
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmationModal({ request, onConfirm, onBack }: ConfirmationModalProps) {
  const isCancellation = request.type === 'cancel-license';
  const hasGoogleImport = false;
  const changedFields = 4;
  const unchangedFields = 18;
  const missingRequired = 0;

  return (
    <div className="absolute inset-0 z-50 bg-black/75 flex items-center justify-center">
      <div className="w-[520px] bg-[#1e2533] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/8">
          <h2 className="text-white font-semibold">تأكيد اعتماد البيانات</h2>
          <p className="text-xs text-white/40 mt-0.5">مراجعة ملخص التغييرات قبل النشر على بلدي+</p>
        </div>

        <div className="p-6 space-y-4">
          {/* POI summary */}
          <div className="flex items-center gap-3 p-3 bg-[#161b27] rounded-lg border border-white/8">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{request.poiName}</p>
              <p className="text-xs text-white/40">{request.city} · {request.district}</p>
            </div>
            <div className="mr-auto text-left">
              <p className="text-xs text-white/30">{request.requestId}</p>
              <p className="text-xs text-white/40">{sourceLabels[request.source]} · {requestTypeLabels[request.type]}</p>
            </div>
          </div>

          {/* Field summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
              <div className="text-2xl font-bold text-blue-400">{changedFields}</div>
              <div className="text-xs text-white/40 mt-1">حقل محدّث</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/8 text-center">
              <div className="text-2xl font-bold text-white/50">{unchangedFields}</div>
              <div className="text-xs text-white/40 mt-1">حقل بدون تغيير</div>
            </div>
            <div className={`p-3 rounded-lg text-center border ${
              missingRequired > 0
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-emerald-500/10 border-emerald-500/20'
            }`}>
              <div className={`text-2xl font-bold ${missingRequired > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {missingRequired}
              </div>
              <div className="text-xs text-white/40 mt-1">حقول مطلوبة ناقصة</div>
            </div>
          </div>

          {/* Data source summary */}
          <div className="space-y-2">
            <p className="text-xs text-white/40 font-medium">مصادر البيانات المعتمدة:</p>
            {[
              { source: 'بلدي+ الحالية', count: 16, color: 'bg-blue-500' },
              { source: sourceLabels[request.source], count: changedFields - 2, color: 'bg-violet-500' },
              { source: 'Google Maps', count: 2, color: 'bg-orange-500' },
              { source: 'إدخال يدوي', count: 0, color: 'bg-gray-500' },
            ].filter(s => s.count > 0).map(item => (
              <div key={item.source} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-xs text-white/60 flex-1">{item.source}</span>
                <span className="text-xs text-white/40 tabular-nums">{item.count} حقل</span>
              </div>
            ))}
          </div>

          {/* Map preview */}
          <div className="h-24 bg-[#0d1117] rounded-lg border border-white/8 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="g2" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#g2)" />
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1f2937" strokeWidth="6" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1f2937" strokeWidth="6" />
              </svg>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-lg">
                <MapPin className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-xs text-white/40 mt-1 font-mono">{request.currentData?.coordinates || '24.7136, 46.6753'}</span>
            </div>
          </div>

          {/* Warnings */}
          {isCancellation && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">سيتم تغيير حالة المعلم إلى <strong>مغلق</strong> بعد الاعتماد.</p>
            </div>
          )}
          {hasGoogleImport && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
              <p className="text-xs text-orange-300">تم استيراد بعض الحقول من Google Maps — تحقق من دقتها</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-white/8 flex gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للمراجعة
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle className="w-4 h-4" />
            اعتماد ونشر إلى بلدي+
          </button>
        </div>
      </div>
    </div>
  );
}
