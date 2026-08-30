import { useState } from "react";
import {
  ClipboardList, Camera, MapPin, CheckCircle, Clock, User,
  AlertTriangle, Plus, ChevronDown, ChevronUp, Star, Check
} from "lucide-react";
import type { POIRequest } from "./data";

interface FieldSurveyDataProps {
  request: POIRequest;
}

type VerificationStatus = "verified" | "discrepancy" | "unverified" | "not-visited";

interface SurveyField {
  key: string;
  label: string;
  currentValue?: string;
  surveyedValue?: string;
  status: VerificationStatus;
  notes?: string;
}

const SURVEY_PHOTO = "https://images.unsplash.com/photo-1674388609520-a53102671d89?w=400&h=250&fit=crop&auto=format";

const statusConfig: Record<VerificationStatus, { label: string; color: string; bg: string; icon: string }> = {
  verified: { label: "مطابق", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", icon: "✓" },
  discrepancy: { label: "تعارض", color: "text-red-400", bg: "bg-red-500/15 border-red-500/30", icon: "!" },
  unverified: { label: "لم يتحقق", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", icon: "?" },
  "not-visited": { label: "لم يُزار", color: "text-white/30", bg: "bg-white/5 border-white/10", icon: "—" },
};

const mockSurveyData: SurveyField[] = [
  {
    key: "nameAr",
    label: "اسم المعلم بالعربية",
    currentValue: "مطعم الوادي العربي",
    surveyedValue: "مطعم الوادي العربي الأصيل",
    status: "discrepancy",
    notes: "اللوحة الخارجية تحمل الاسم الجديد",
  },
  {
    key: "coordinates",
    label: "الإحداثيات",
    currentValue: "24.7136, 46.6753",
    surveyedValue: "24.7137, 46.6754",
    status: "verified",
  },
  {
    key: "phone",
    label: "رقم الجوال",
    currentValue: "0114567890",
    surveyedValue: "0554567890",
    status: "discrepancy",
    notes: "الرقم الجديد مثبت على باب المحل",
  },
  {
    key: "openTime",
    label: "وقت الفتح",
    currentValue: "07:00",
    surveyedValue: "06:30",
    status: "verified",
  },
  {
    key: "parking",
    label: "مواقف سيارات",
    currentValue: undefined,
    surveyedValue: "يتوفر 15 موقف أمام المبنى",
    status: "verified",
  },
  {
    key: "signage",
    label: "صورة اللوحة",
    currentValue: undefined,
    surveyedValue: "تم التقاط 3 صور",
    status: "verified",
  },
  {
    key: "floors",
    label: "عدد الأدوار",
    currentValue: "1",
    surveyedValue: "1",
    status: "verified",
  },
  {
    key: "entrances",
    label: "عدد المداخل",
    currentValue: "2",
    surveyedValue: undefined,
    status: "unverified",
  },
];

function SurveyFieldRow({ field }: { field: SurveyField }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[field.status];

  return (
    <div className={`rounded-lg border ${cfg.bg} mb-1.5 overflow-hidden`}>
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${cfg.color} border-current`}>
          {cfg.icon}
        </span>
        <span className="text-xs text-white/70 flex-1">{field.label}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${cfg.color} font-medium`}>{cfg.label}</span>
        {(field.notes || field.surveyedValue !== field.currentValue) && (
          expanded ? <ChevronUp className="w-3 h-3 text-white/30" /> : <ChevronDown className="w-3 h-3 text-white/30" />
        )}
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t border-white/8 pt-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-white/30 mb-0.5">القيمة الحالية</p>
              <p className="text-xs text-white/60">{field.currentValue || <span className="italic text-white/25">غير متوفر</span>}</p>
            </div>
            <div>
              <p className="text-xs text-white/30 mb-0.5">قيمة المسح</p>
              <p className={`text-xs font-medium ${field.status === "discrepancy" ? "text-amber-300" : "text-emerald-300"}`}>
                {field.surveyedValue || <span className="italic text-white/25">لم يُسجل</span>}
              </p>
            </div>
          </div>
          {field.notes && (
            <div className="flex items-start gap-1.5 px-2 py-1.5 bg-white/5 rounded text-xs text-white/50">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
              <span>{field.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FieldSurveyData({ request }: FieldSurveyDataProps) {
  const [showAddSurvey, setShowAddSurvey] = useState(false);
  const [surveyNotes, setSurveyNotes] = useState("");
  const [rating, setRating] = useState(0);

  const verified = mockSurveyData.filter(f => f.status === "verified").length;
  const discrepancies = mockSurveyData.filter(f => f.status === "discrepancy").length;
  const unverified = mockSurveyData.filter(f => f.status === "unverified").length;

  return (
    <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
      <div className="p-4 space-y-4">
        {/* Header info */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">بيانات المسح الميداني</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                مكتمل
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> محمد السلمي</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 08 يونيو 2024</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> الرياض · العليا</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddSurvey(true)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة مسح
          </button>
        </div>

        {/* Summary counters */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-xl font-bold text-emerald-400">{verified}</div>
            <div className="text-xs text-white/40 mt-0.5">مطابق</div>
          </div>
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <div className="text-xl font-bold text-red-400">{discrepancies}</div>
            <div className="text-xs text-white/40 mt-0.5">تعارض</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-xl font-bold text-amber-400">{unverified}</div>
            <div className="text-xs text-white/40 mt-0.5">لم يتحقق</div>
          </div>
        </div>

        {/* Survey photos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/50 font-medium">صور المسح الميداني</p>
            <span className="text-xs text-white/30">3 صور</span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex-1 aspect-video rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-blue-500/40 transition-colors relative group">
                <img src={SURVEY_PHOTO} alt={`صورة مسح ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div className="absolute bottom-1 right-1 text-xs bg-black/60 text-white/60 px-1 rounded">
                  {["اللوحة", "الخارج", "الداخل"][i]}
                </div>
              </div>
            ))}
            <div className="flex-1 aspect-video rounded-lg border border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-blue-500/40 transition-colors">
              <Plus className="w-5 h-5 text-white/20" />
            </div>
          </div>
        </div>

        {/* Surveyor rating */}
        <div>
          <p className="text-xs text-white/50 mb-2">تقييم المسّاح لجودة البيانات</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                className={`w-5 h-5 cursor-pointer transition-colors ${i <= (rating || 4) ? "text-amber-400 fill-amber-400" : "text-white/20"}`}
                onClick={() => setRating(i)}
              />
            ))}
            <span className="text-xs text-white/40 mr-2">{rating || 4}/5 — جيد جداً</span>
          </div>
        </div>

        {/* Field verification table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/50 font-medium">نتائج التحقق الميداني</p>
            <div className="flex gap-1">
              <span className="text-xs text-white/25">كل الحقول ({mockSurveyData.length})</span>
            </div>
          </div>
          <div>
            {mockSurveyData.map(field => (
              <SurveyFieldRow key={field.key} field={field} />
            ))}
          </div>
        </div>

        {/* Surveyor observations */}
        <div>
          <p className="text-xs text-white/50 mb-2">ملاحظات المسّاح الميداني</p>
          <div className="p-3 bg-[#1e2533] border border-white/8 rounded-lg text-xs text-white/60 leading-relaxed">
            المحل مفتوح ونشط. اللوحة الخارجية تحمل الاسم الجديد "الوادي العربي الأصيل".
            يوجد 15 موقف سيارة أمام المبنى غير مسجل في البيانات الحالية.
            رقم الهاتف المعروض على الباب هو 055 وليس 011.
          </div>
        </div>

        {/* GPS track */}
        <div>
          <p className="text-xs text-white/50 mb-2">مسار GPS للمسّاح</p>
          <div className="h-20 bg-[#1e2533] border border-white/8 rounded-lg flex items-center justify-center relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-30">
              <defs><pattern id="sg" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#sg)"/>
            </svg>
            <svg className="absolute inset-0 w-full h-full">
              <polyline points="20%,60% 35%,55% 50%,50% 60%,52% 70%,48%" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <circle cx="20%" cy="60%" r="4" fill="#3b82f6" stroke="white" strokeWidth="1.5"/>
              <circle cx="70%" cy="48%" r="4" fill="#10b981" stroke="white" strokeWidth="1.5"/>
            </svg>
            <div className="absolute bottom-1 right-2 text-xs text-white/30 font-mono">08-06-2024 · 14:32</div>
            <div className="absolute bottom-1 left-2 text-xs text-emerald-400">وصل للمعلم</div>
          </div>
        </div>

        {/* Action to apply discrepancies */}
        {discrepancies > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-300 font-medium">يوجد {discrepancies} تعارض بين المسح والبيانات الحالية</p>
                <p className="text-xs text-white/40 mt-0.5">هل تريد تطبيق قيم المسح الميداني على الحقول المتعارضة؟</p>
              </div>
            </div>
            <button className="w-full text-xs px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              تطبيق قيم المسح على الحقول المتعارضة
            </button>
          </div>
        )}
      </div>

      {/* Add new survey modal */}
      {showAddSurvey && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="w-[480px] bg-[#1e2533] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">إضافة مسح ميداني جديد</h3>
              <button onClick={() => setShowAddSurvey(false)} className="text-white/40 hover:text-white">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 block mb-1">اسم المسّاح</label>
                  <input className="w-full text-sm px-3 py-2 bg-[#161b27] border border-white/10 rounded-lg text-white/70 outline-none" placeholder="الاسم الكامل" dir="rtl" />
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1">تاريخ الزيارة</label>
                  <input type="date" className="w-full text-sm px-3 py-2 bg-[#161b27] border border-white/10 rounded-lg text-white/70 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">ملاحظات الزيارة</label>
                <textarea
                  value={surveyNotes} onChange={e => setSurveyNotes(e.target.value)}
                  rows={4} placeholder="أدخل ملاحظاتك الميدانية..."
                  className="w-full text-sm px-3 py-2 bg-[#161b27] border border-white/10 rounded-lg text-white/70 placeholder-white/25 outline-none resize-none" dir="rtl"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-2">صور الزيارة</label>
                <div className="flex gap-2">
                  {["اللوحة", "الخارج", "الداخل"].map(t => (
                    <div key={t} className="flex-1 h-16 bg-[#161b27] border border-dashed border-white/15 rounded flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/30 transition-colors">
                      <Camera className="w-4 h-4 text-white/20 mb-1" />
                      <span className="text-xs text-white/20">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-white/8 flex justify-end gap-2">
              <button onClick={() => setShowAddSurvey(false)} className="px-4 py-2 text-xs text-white/50 hover:text-white">إلغاء</button>
              <button className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                حفظ بيانات المسح
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
