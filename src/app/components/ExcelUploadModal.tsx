import { useState, useRef } from "react";
import {
  X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle,
  ChevronDown, ChevronUp, Eye, Trash2, Send, Download,
  RefreshCw, Check, XCircle, Clock
} from "lucide-react";

interface ExcelUploadModalProps {
  onClose: () => void;
  isSupervisor?: boolean;
}

type UploadStep = "upload" | "preview" | "submitted" | "supervisor-review";

interface ParsedRow {
  id: number;
  nameAr: string;
  nameEn?: string;
  category: string;
  city: string;
  district: string;
  coordinates: string;
  phone?: string;
  website?: string;
  status: "valid" | "warning" | "error";
  issues?: string[];
}

// Mock parsed data
const mockParsedRows: ParsedRow[] = [
  { id: 1, nameAr: "مطعم الوادي الجديد", nameEn: "Al-Wadi New Restaurant", category: "مطاعم وكافيهات", city: "الرياض", district: "العليا", coordinates: "24.7136, 46.6753", phone: "0114567890", website: "www.alwadi.sa", status: "valid" },
  { id: 2, nameAr: "صيدلية الأمل", category: "صحة وطب", city: "جدة", district: "الحمراء", coordinates: "21.5433, 39.1728", phone: "0125678901", status: "valid" },
  { id: 3, nameAr: "سوبرماركت النجمة", category: "تسوق", city: "الدمام", district: "العزيزية", coordinates: "", phone: "0138901234", status: "warning", issues: ["الإحداثيات غير متوفرة"] },
  { id: 4, nameAr: "مركز اللياقة الذهبية", category: "رياضة وترفيه", city: "الرياض", district: "الملقا", coordinates: "24.8021, 46.6385", status: "valid" },
  { id: 5, nameAr: "", category: "تقنية واتصالات", city: "مكة المكرمة", district: "العزيزية", coordinates: "21.4225, 39.8262", status: "error", issues: ["اسم المعلم مفقود"] },
  { id: 6, nameAr: "فندق النخيل الفاخر", nameEn: "Al-Nakheel Luxury Hotel", category: "فنادق وإقامة", city: "المدينة المنورة", district: "العوالي", coordinates: "24.4686, 39.6142", phone: "0148901234", website: "www.nakheel-hotel.sa", status: "valid" },
  { id: 7, nameAr: "بقالة الحي السعيد", category: "تسوق", city: "أبها", district: "المنهل", coordinates: "18.2465, 42.5053", phone: "0178901234", status: "warning", issues: ["اسم المعلم بالإنجليزية مفقود"] },
  { id: 8, nameAr: "مدرسة النور الأهلية", category: "تعليم", city: "الرياض", district: "الروضة", coordinates: "24.7514, 46.7320", phone: "0115678901", status: "valid" },
];

// Pending uploads for supervisor view
const pendingUploads = [
  { id: "UPL-001", uploadedBy: "أحمد العمري", date: "2024-06-12 09:34", count: 8, valid: 6, warnings: 2, errors: 0, filename: "معالم_يونيو_2024.xlsx" },
  { id: "UPL-002", uploadedBy: "فهد العتيبي", date: "2024-06-11 14:20", count: 15, valid: 12, warnings: 2, errors: 1, filename: "معالم_جدة.xlsx" },
  { id: "UPL-003", uploadedBy: "سارة الزهراني", date: "2024-06-10 11:05", count: 23, valid: 22, warnings: 1, errors: 0, filename: "مراكز_صحية.xlsx" },
];

function StatusBadge({ status }: { status: "valid" | "warning" | "error" }) {
  if (status === "valid")   return <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">صحيح</span>;
  if (status === "warning") return <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">تحذير</span>;
  return                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400">خطأ</span>;
}

export function ExcelUploadModal({ onClose, isSupervisor = false }: ExcelUploadModalProps) {
  const [step, setStep] = useState<UploadStep>(isSupervisor ? "supervisor-review" : "upload");
  const [isDragOver, setIsDragOver] = useState(false);
  const [filename, setFilename] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set(mockParsedRows.filter(r => r.status !== "error").map(r => r.id)));
  const [approvedUpload, setApprovedUpload] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validCount   = mockParsedRows.filter(r => r.status === "valid").length;
  const warningCount = mockParsedRows.filter(r => r.status === "warning").length;
  const errorCount   = mockParsedRows.filter(r => r.status === "error").length;
  const selectedValid = [...selectedRows].filter(id => {
    const row = mockParsedRows.find(r => r.id === id);
    return row && row.status !== "error";
  }).length;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) { setFilename(file.name); setStep("preview"); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setFilename(file.name); setStep("preview"); }
  };

  const toggleRow = (id: number) => setExpandedRows(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleSelect = (id: number) => setSelectedRows(prev => {
    const row = mockParsedRows.find(r => r.id === id);
    if (row?.status === "error") return prev;
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-4xl bg-[#1e2533] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[#161b27] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {isSupervisor ? "اعتماد البيانات المرفوعة" : "رفع بيانات من ملف Excel"}
              </h2>
              <p className="text-xs text-white/40">
                {isSupervisor ? "مراجعة الملفات المنتظرة للاعتماد" : "رفع بيانات معالم متعددة دفعة واحدة"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress steps (non-supervisor) */}
        {!isSupervisor && step !== "submitted" && (
          <div className="flex items-center gap-0 px-6 py-3 border-b border-white/8 shrink-0 bg-[#161b27]">
            {[
              { id: "upload", label: "رفع الملف" },
              { id: "preview", label: "مراجعة البيانات" },
              { id: "submitted", label: "إرسال للاعتماد" },
            ].map((s, i, arr) => {
              const isActive = s.id === step;
              const isDone = step === "preview" && i === 0;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone ? "bg-emerald-500 text-white" : isActive ? "bg-blue-600 text-white" : "bg-white/10 text-white/30"
                    }`}>
                      {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={`text-xs ${isActive ? "text-white" : isDone ? "text-emerald-400" : "text-white/30"}`}>{s.label}</span>
                  </div>
                  {i < arr.length - 1 && <div className="w-12 h-px bg-white/10 mx-3" />}
                </div>
              );
            })}
          </div>
        )}

        {/* ── STEP: Upload ── */}
        {step === "upload" && (
          <div className="flex-1 p-8 flex flex-col items-center justify-center">
            <div
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all ${
                isDragOver ? "border-emerald-500/60 bg-emerald-500/5" : "border-white/15 hover:border-white/30 hover:bg-white/3"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium mb-1">اسحب ملف Excel هنا أو اضغط للاختيار</p>
                <p className="text-sm text-white/40">يدعم الصيغ: .xlsx, .xls, .csv</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/30">
                <span>الحد الأقصى: 1000 معلم في ملف واحد</span>
                <span>·</span>
                <span>الحجم الأقصى: 10 MB</span>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileSelect} />

            <div className="mt-6 flex items-center gap-3">
              <button className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white transition-colors">
                <Download className="w-3.5 h-3.5" />
                تحميل قالب Excel الجاهز
              </button>
              <span className="text-white/20 text-xs">أو</span>
              <button onClick={() => { setFilename("بيانات_اختبار.xlsx"); setStep("preview"); }}
                className="text-xs px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 transition-colors">
                استخدام بيانات تجريبية
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Preview ── */}
        {step === "preview" && (
          <>
            {/* File info + summary */}
            <div className="px-5 py-3 border-b border-white/8 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-white font-medium">{filename}</p>
                    <p className="text-xs text-white/40">{mockParsedRows.length} صف محلّل</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-3.5 h-3.5" />{validCount} صحيح</span>
                    <span className="flex items-center gap-1 text-amber-400"><AlertTriangle className="w-3.5 h-3.5" />{warningCount} تحذير</span>
                    <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3.5 h-3.5" />{errorCount} خطأ</span>
                  </div>
                  <button className="text-xs px-2 py-1 rounded border border-white/10 text-white/40 hover:text-white">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Note about errors */}
            {errorCount > 0 && (
              <div className="mx-5 mt-3 shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-300">
                  يوجد {errorCount} صفوف بها أخطاء وسيتم استبعادها تلقائياً. يمكنك إلغاء تحديد صفوف التحذير أيضاً.
                </p>
              </div>
            )}

            {/* Table */}
            <div className="flex-1 overflow-y-auto mx-5 mt-3 mb-0 rounded-xl border border-white/8 overflow-hidden">
              {/* Table header */}
              <div className="grid gap-0 border-b border-white/8 bg-[#161b27] sticky top-0"
                style={{ gridTemplateColumns: "32px 32px 1fr 100px 120px 120px 80px" }}>
                {["", "", "اسم المعلم", "التصنيف", "المدينة", "الإحداثيات", "الحالة"].map((h, i) => (
                  <div key={i} className="px-3 py-2.5 text-xs text-white/40 font-medium">{h}</div>
                ))}
              </div>

              {mockParsedRows.map(row => (
                <div key={row.id}>
                  <div
                    className={`grid gap-0 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                      row.status === "error" ? "opacity-50" : ""
                    }`}
                    style={{ gridTemplateColumns: "32px 32px 1fr 100px 120px 120px 80px" }}
                    onClick={() => toggleRow(row.id)}
                  >
                    {/* Row number */}
                    <div className="px-3 py-2.5 flex items-center">
                      <span className="text-xs text-white/20">{row.id}</span>
                    </div>
                    {/* Checkbox */}
                    <div className="px-1 py-2.5 flex items-center" onClick={e => { e.stopPropagation(); toggleSelect(row.id); }}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        row.status === "error" ? "border-white/10 cursor-not-allowed" :
                        selectedRows.has(row.id) ? "bg-blue-600 border-blue-500" : "border-white/20 hover:border-white/40"
                      }`}>
                        {selectedRows.has(row.id) && row.status !== "error" && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>
                    {/* Name */}
                    <div className="px-3 py-2.5 flex items-center">
                      <span className={`text-sm ${row.nameAr ? "text-white/80" : "text-red-400 italic"}`}>
                        {row.nameAr || "— اسم مفقود —"}
                      </span>
                    </div>
                    <div className="px-3 py-2.5 flex items-center">
                      <span className="text-xs text-white/50 truncate">{row.category}</span>
                    </div>
                    <div className="px-3 py-2.5 flex items-center gap-1">
                      <span className="text-xs text-white/50">{row.city}</span>
                      <span className="text-xs text-white/25">· {row.district}</span>
                    </div>
                    <div className="px-3 py-2.5 flex items-center">
                      {row.coordinates
                        ? <span className="text-xs text-white/40 font-mono">{row.coordinates}</span>
                        : <span className="text-xs text-amber-400/60 italic">غير متوفر</span>
                      }
                    </div>
                    <div className="px-3 py-2.5 flex items-center">
                      <StatusBadge status={row.status} />
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedRows.has(row.id) && (
                    <div className="px-10 py-3 bg-white/[0.02] border-b border-white/5">
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        {row.nameEn && <div><span className="text-white/30">الاسم الإنجليزي: </span><span className="text-white/60">{row.nameEn}</span></div>}
                        {row.phone && <div><span className="text-white/30">الجوال: </span><span className="text-white/60 font-mono" dir="ltr">{row.phone}</span></div>}
                        {row.website && <div><span className="text-white/30">الموقع: </span><span className="text-blue-400">{row.website}</span></div>}
                      </div>
                      {row.issues && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {row.issues.map(issue => (
                            <span key={issue} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                              <AlertTriangle className="w-3 h-3" />{issue}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/8 shrink-0 flex items-center justify-between bg-[#161b27]">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Check className="w-3.5 h-3.5 text-blue-400" />
                <span><span className="text-white/70">{selectedRows.size}</span> صف محدد للرفع</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep("upload")}
                  className="px-4 py-2 text-xs border border-white/10 text-white/50 hover:text-white rounded-lg transition-colors">
                  رفع ملف آخر
                </button>
                <button
                  onClick={() => setStep("submitted")}
                  disabled={selectedRows.size === 0}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-40 shadow-lg shadow-emerald-600/20"
                >
                  <Send className="w-4 h-4" />
                  إرسال للمشرف للاعتماد ({selectedRows.size})
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP: Submitted ── */}
        {step === "submitted" && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-1">تم الإرسال بنجاح</h3>
              <p className="text-sm text-white/50 mb-1">
                تم رفع <span className="text-white font-medium">{selectedRows.size} معلماً</span> وإرسالها للمشرف للاعتماد
              </p>
              <p className="text-xs text-white/30">رقم الطلب: <span className="font-mono text-white/50">UPL-2024-00{Math.floor(Math.random() * 900) + 100}</span></p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-amber-300">بانتظار موافقة المشرف — ستصلك إشعار عند الاعتماد</p>
            </div>
            <button onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors mt-2">
              إغلاق
            </button>
          </div>
        )}

        {/* ── SUPERVISOR VIEW ── */}
        {step === "supervisor-review" && (
          <div className="flex-1 overflow-y-auto p-5">
            <p className="text-xs text-white/40 mb-4">
              {pendingUploads.length} ملفات بانتظار الاعتماد
            </p>
            <div className="space-y-3">
              {pendingUploads.map(upload => (
                <div key={upload.id} className={`rounded-xl border overflow-hidden transition-all ${
                  approvedUpload === upload.id ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/8 bg-[#161b27]"
                }`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-medium text-white">{upload.filename}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span>رُفع بواسطة: <span className="text-white/60">{upload.uploadedBy}</span></span>
                          <span>·</span>
                          <span>{upload.date}</span>
                          <span>·</span>
                          <span className="font-mono text-white/30">{upload.id}</span>
                        </div>
                      </div>
                      {approvedUpload === upload.id ? (
                        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                          <Check className="w-3 h-3" />معتمد
                        </span>
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400" />
                      )}
                    </div>

                    {/* Row stats */}
                    <div className="flex items-center gap-4 text-xs mb-4">
                      <span className="text-white/40">إجمالي الصفوف: <span className="text-white/70">{upload.count}</span></span>
                      <span className="text-emerald-400"><CheckCircle className="w-3 h-3 inline ml-0.5" />{upload.valid} صحيح</span>
                      <span className="text-amber-400"><AlertTriangle className="w-3 h-3 inline ml-0.5" />{upload.warnings} تحذير</span>
                      {upload.errors > 0 && <span className="text-red-400"><XCircle className="w-3 h-3 inline ml-0.5" />{upload.errors} خطأ</span>}
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: `${(upload.valid / upload.count) * 100}%` }} />
                        <div className="h-full bg-amber-500" style={{ width: `${(upload.warnings / upload.count) * 100}%` }} />
                        {upload.errors > 0 && <div className="h-full bg-red-500 rounded-l-full" style={{ width: `${(upload.errors / upload.count) * 100}%` }} />}
                      </div>
                      <span className="text-xs text-white/40">{Math.round((upload.valid / upload.count) * 100)}% قابل للاعتماد</span>
                    </div>

                    {/* Actions */}
                    {approvedUpload !== upload.id && (
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-white/10 text-white/50 hover:text-white rounded-lg transition-colors">
                          <Eye className="w-3.5 h-3.5" />معاينة البيانات
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-500/30 text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />رفض
                        </button>
                        <button
                          onClick={() => setApprovedUpload(upload.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
                        >
                          <CheckCircle className="w-4 h-4" />
                          اعتماد ونشر {upload.valid + upload.warnings} معلم
                        </button>
                      </div>
                    )}

                    {approvedUpload === upload.id && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <CheckCircle className="w-4 h-4" />
                        تم الاعتماد ونشر المعالم على خريطة بلدي+ بنجاح
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
