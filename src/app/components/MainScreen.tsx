import { useState } from "react";
import {
  Search, Plus, SlidersHorizontal, MapPin, Clock,
  ChevronDown, RefreshCw, Download, X, ChevronLeft,
  ClipboardList, CheckCircle, AlertTriangle, User, Calendar,
  Camera, FileText, FileSpreadsheet
} from "lucide-react";
import { MapCanvas } from "./MapCanvas";
import { RequestCard } from "./RequestCard";
import { mockRequests } from "./data";
import type { POIRequest } from "./data";

interface MainScreenProps {
  onReview: (request: POIRequest) => void;
  onAddPOI: () => void;
  onExcelUpload?: () => void;
}

type QueueTab = "business" | "users" | "current" | "field-visits";

const stats = [
  { label: "جديد", value: 24, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-500/20" },
  { label: "قيد المراجعة", value: 8, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-500/20" },
  { label: "يتطلب تعديل", value: 3, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-500/20" },
  { label: "معتمد اليوم", value: 15, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-500/20" },
];

const cities = ["الكل", "الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة"];
const priorities = ["الكل", "عالية", "متوسطة", "منخفضة"];

// ── Field Visit POI types ──────────────────────────────────────────────
type FieldVisitStatus = "pending-review" | "approved" | "needs-data" | "draft";

interface FieldVisitPOI {
  id: string;
  poiName: string;
  category: string;
  city: string;
  district: string;
  surveyorName: string;
  visitDate: string;
  status: FieldVisitStatus;
  completionPct: number;
  photosCount: number;
  coordinates: string;
  notes?: string;
}

const fieldVisitStatusConfig: Record<FieldVisitStatus, { label: string; color: string; bg: string }> = {
  "pending-review": { label: "بانتظار المراجعة", color: "text-amber-300", bg: "bg-amber-500/15 border-amber-500/30" },
  "approved":       { label: "معتمد",            color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-500/30" },
  "needs-data":     { label: "بيانات ناقصة",     color: "text-orange-300",  bg: "bg-orange-500/15 border-orange-500/30" },
  "draft":          { label: "مسودة",             color: "text-white/40",   bg: "bg-white/5 border-white/10" },
};

const mockFieldVisitPOIs: FieldVisitPOI[] = [
  {
    id: "fv-001",
    poiName: "مطعم الشام الأصيل",
    category: "مطاعم وكافيهات",
    city: "الرياض",
    district: "الملقا",
    surveyorName: "محمد السلمي",
    visitDate: "2024-06-12",
    status: "pending-review",
    completionPct: 88,
    photosCount: 5,
    coordinates: "24.8021, 46.6385",
    notes: "مطعم جديد افتتح قبل شهر، لافتة جيدة",
  },
  {
    id: "fv-002",
    poiName: "صيدلية الرعاية الدوائية",
    category: "صحة وطب",
    city: "الرياض",
    district: "الروضة",
    surveyorName: "فهد العتيبي",
    visitDate: "2024-06-11",
    status: "needs-data",
    completionPct: 55,
    photosCount: 2,
    coordinates: "24.7514, 46.7320",
    notes: "رقم الهاتف غير واضح، يحتاج مراجعة",
  },
  {
    id: "fv-003",
    poiName: "مركز لياقة فيتنس برو",
    category: "رياضة وترفيه",
    city: "جدة",
    district: "النعيم",
    surveyorName: "عبدالله القحطاني",
    visitDate: "2024-06-10",
    status: "approved",
    completionPct: 100,
    photosCount: 8,
    coordinates: "21.5891, 39.1684",
  },
  {
    id: "fv-004",
    poiName: "بقالة الحي الجديدة",
    category: "تسوق",
    city: "الرياض",
    district: "النرجس",
    surveyorName: "محمد السلمي",
    visitDate: "2024-06-12",
    status: "draft",
    completionPct: 30,
    photosCount: 1,
    coordinates: "24.8256, 46.7012",
    notes: "بيانات التواصل غير مكتملة",
  },
  {
    id: "fv-005",
    poiName: "مقهى القهوة العربية",
    category: "مطاعم وكافيهات",
    city: "الدمام",
    district: "العزيزية",
    surveyorName: "سلطان الدوسري",
    visitDate: "2024-06-09",
    status: "approved",
    completionPct: 95,
    photosCount: 6,
    coordinates: "26.3992, 50.0075",
  },
];

// ── Field Visit Card ───────────────────────────────────────────────────
function FieldVisitCard({
  poi,
  onReview,
  selected,
}: {
  poi: FieldVisitPOI;
  onReview: (poi: FieldVisitPOI) => void;
  selected?: boolean;
}) {
  const cfg = fieldVisitStatusConfig[poi.status];
  const isComplete = poi.completionPct === 100;

  return (
    <div className={`rounded-lg border transition-all ${
      selected ? "border-violet-500/50 bg-violet-600/8" : "border-white/8 bg-[#1e2533]/60 hover:border-white/15 hover:bg-[#1e2533]"
    }`}>
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="text-sm font-medium text-white truncate">{poi.poiName}</span>
            </div>
            <span className="text-xs text-white/40">{poi.category}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded border shrink-0 ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/40 mb-2">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />{poi.city} · {poi.district}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />{poi.surveyorName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(poi.visitDate).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Camera className="w-3 h-3" />{poi.photosCount} صور
          </span>
        </div>

        {/* Completeness bar */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                poi.completionPct === 100 ? "bg-emerald-500"
                : poi.completionPct >= 70 ? "bg-blue-500"
                : poi.completionPct >= 40 ? "bg-amber-500"
                : "bg-red-500"
              }`}
              style={{ width: `${poi.completionPct}%` }}
            />
          </div>
          <span className="text-xs text-white/50 tabular-nums w-8">{poi.completionPct}%</span>
          {poi.completionPct < 100 && (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          {poi.completionPct === 100 && (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
        </div>

        {/* Notes */}
        {poi.notes && (
          <div className="flex items-start gap-1.5 px-2 py-1.5 bg-white/4 rounded text-xs text-white/45 mb-2">
            <FileText className="w-3 h-3 shrink-0 mt-0.5 text-white/30" />
            <span className="leading-relaxed">{poi.notes}</span>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="border-t border-white/6 px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-white/25 font-mono">{poi.coordinates}</span>
        <button
          onClick={() => onReview(poi)}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded transition-colors ${
            poi.status === "needs-data" || poi.status === "draft"
              ? "bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
              : "bg-violet-600 hover:bg-violet-700 text-white"
          }`}
        >
          {poi.status === "approved" ? "عرض" : "مراجعة"}
          <ChevronLeft className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────
export function MainScreen({ onReview, onAddPOI, onExcelUpload }: MainScreenProps) {
  const [activeTab, setActiveTab] = useState<QueueTab>("business");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("الكل");
  const [showFilters, setShowFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("الكل");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [selectedFieldVisit, setSelectedFieldVisit] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [fieldVisitStatusFilter, setFieldVisitStatusFilter] = useState<FieldVisitStatus | "all">("all");

  const filtered = mockRequests.filter(r => {
    const matchesTab =
      activeTab === "business" ? r.source === "balady-business" :
      activeTab === "users" ? r.source === "balady-plus" : true;
    const matchesSearch = !search || r.poiName.includes(search) || r.requestId.includes(search);
    const matchesCity = cityFilter === "الكل" || r.city === cityFilter;
    const matchesPriority =
      priorityFilter === "الكل" ||
      (priorityFilter === "عالية" && r.priority === "high") ||
      (priorityFilter === "متوسطة" && r.priority === "medium") ||
      (priorityFilter === "منخفضة" && r.priority === "low");
    return matchesTab && matchesSearch && matchesCity && matchesPriority;
  });

  const filteredFieldVisits = mockFieldVisitPOIs.filter(p =>
    (fieldVisitStatusFilter === "all" || p.status === fieldVisitStatusFilter) &&
    (!search || p.poiName.includes(search) || p.surveyorName.includes(search))
  );

  const fieldVisitStats = {
    pending: mockFieldVisitPOIs.filter(p => p.status === "pending-review").length,
    approved: mockFieldVisitPOIs.filter(p => p.status === "approved").length,
    needsData: mockFieldVisitPOIs.filter(p => p.status === "needs-data").length,
    draft: mockFieldVisitPOIs.filter(p => p.status === "draft").length,
  };

  const handleReview = (req: POIRequest) => {
    setSelectedRequest(req.id);
    onReview(req);
  };

  const tabs = [
    { id: "business" as const, label: "بلدي أعمال", count: mockRequests.filter(r => r.source === "balady-business").length },
    { id: "users" as const, label: "بلدي+", count: mockRequests.filter(r => r.source === "balady-plus").length },
    { id: "current" as const, label: "المعالم", count: 1428 },
    { id: "field-visits" as const, label: "المسح الميداني", count: mockFieldVisitPOIs.length, highlight: fieldVisitStats.pending > 0 },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapCanvas markers={filtered.map(r => ({ lat: r.lat, lng: r.lng, label: r.poiName }))} />
      </div>

      {/* Top-left overlay */}
      <div className="absolute top-4 left-14 z-10 flex gap-2">
        <div className="bg-[#161b27]/90 backdrop-blur border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-white text-xs font-medium">{filtered.length} نقطة</span>
        </div>
        <button className="bg-[#161b27]/90 backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-white/60 hover:text-white text-xs flex items-center gap-1.5 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />تحديث
        </button>
        <button className="bg-[#161b27]/90 backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-white/60 hover:text-white text-xs flex items-center gap-1.5 transition-colors">
          <Download className="w-3.5 h-3.5" />تصدير
        </button>
      </div>

      {/* Panel toggle (when closed) */}
      {!panelOpen && (
        <button onClick={() => setPanelOpen(true)}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Overlay panel */}
      <div
        className={`absolute top-0 bottom-0 right-0 z-20 flex transition-transform duration-300 ease-in-out ${panelOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "390px" }}
      >
        <div className="flex-1 bg-[#161b27]/97 backdrop-blur-sm border-r border-white/8 flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-white/8 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-sm font-semibold text-white">إدارة نقاط الاهتمام</h1>
              <div className="flex items-center gap-2">
                <button onClick={onExcelUpload}
                  title="رفع بيانات من Excel"
                  className="flex items-center gap-1 px-2 py-1.5 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-300 text-xs rounded-lg transition-colors">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Excel
                </button>
                <button onClick={onAddPOI}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors shadow-lg shadow-blue-600/20">
                  <Plus className="w-3.5 h-3.5" />إضافة
                </button>
                <button onClick={() => setPanelOpen(false)}
                  className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {stats.map(s => (
                <div key={s.label} className={`rounded-lg p-2 border ${s.bg}`}>
                  <div className={`text-lg font-bold ${s.color} leading-none mb-0.5`}>{s.value}</div>
                  <div className="text-xs text-white/40 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-white/35 mb-3">
              <Clock className="w-3.5 h-3.5 text-white/25" />
              <span>متوسط المعالجة: <span className="text-white/60">4.2 ساعة</span></span>
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="بحث باسم المعلم أو رقم الطلب..."
                className="w-full pr-9 pl-3 py-2 bg-[#1e2533] border border-white/8 rounded-lg text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/50"
                dir="rtl" />
            </div>

            {/* Filter toggle (only for non-field-visits tabs) */}
            {activeTab !== "field-visits" && (
              <>
                <button onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded border transition-colors w-full ${showFilters ? "border-blue-500/40 text-blue-300 bg-blue-500/10" : "border-white/10 text-white/40 hover:text-white"}`}>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>الفلاتر والتصفية</span>
                  <ChevronDown className={`w-3.5 h-3.5 mr-auto transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
                {showFilters && (
                  <div className="mt-2 p-2.5 bg-[#1e2533] rounded-lg border border-white/8 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-white/40 block mb-1">المدينة</label>
                        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                          className="w-full text-xs bg-[#161b27] border border-white/10 rounded px-2 py-1.5 text-white/70 outline-none" dir="rtl">
                          {cities.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-white/40 block mb-1">الأولوية</label>
                        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
                          className="w-full text-xs bg-[#161b27] border border-white/10 rounded px-2 py-1.5 text-white/70 outline-none" dir="rtl">
                          {priorities.map(p => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-white/20 accent-blue-500" />
                      <span className="text-xs text-white/50">الطلبات المتأخرة فقط</span>
                    </label>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/8 shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-1.5 py-2.5 text-xs transition-all border-b-2 flex items-center justify-center gap-1 ${
                  activeTab === tab.id ? "border-blue-500 text-white bg-blue-500/5" : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                <span className="truncate">{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs shrink-0 relative ${
                  activeTab === tab.id ? "bg-blue-500/20 text-blue-300" : "bg-white/8 text-white/30"
                }`}>
                  {tab.count}
                  {"highlight" in tab && tab.highlight && activeTab !== tab.id && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-[#161b27]" />
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* ── FIELD VISITS TAB content ── */}
          {activeTab === "field-visits" ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {/* Field visits sub-header */}
              <div className="px-3 py-2.5 border-b border-white/8 shrink-0">
                {/* Mini stats */}
                <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                  {[
                    { label: "انتظار", value: fieldVisitStats.pending, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                    { label: "معتمد", value: fieldVisitStats.approved, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                    { label: "ناقص", value: fieldVisitStats.needsData, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
                    { label: "مسودة", value: fieldVisitStats.draft, color: "text-white/40", bg: "bg-white/5 border-white/10" },
                  ].map(s => (
                    <div key={s.label} className={`rounded-lg p-2 border ${s.bg} text-center`}>
                      <div className={`text-base font-bold ${s.color} leading-none mb-0.5`}>{s.value}</div>
                      <div className="text-xs text-white/35">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Status filter chips */}
                <div className="flex gap-1 flex-wrap">
                  {([
                    { id: "all", label: "الكل" },
                    { id: "pending-review", label: "بانتظار المراجعة" },
                    { id: "needs-data", label: "بيانات ناقصة" },
                    { id: "draft", label: "مسودة" },
                    { id: "approved", label: "معتمد" },
                  ] as const).map(f => (
                    <button key={f.id} onClick={() => setFieldVisitStatusFilter(f.id)}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                        fieldVisitStatusFilter === f.id
                          ? "bg-violet-600/25 border-violet-500/40 text-violet-300"
                          : "border-white/10 text-white/35 hover:text-white/60"
                      }`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add new field visit POI button */}
              <div className="px-3 pt-3 pb-1 shrink-0">
                <button
                  onClick={onAddPOI}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-violet-500/40 text-violet-300 hover:bg-violet-600/10 text-xs transition-colors group"
                >
                  <div className="w-5 h-5 rounded-full bg-violet-600/30 flex items-center justify-center group-hover:bg-violet-600/50 transition-colors">
                    <Plus className="w-3 h-3" />
                  </div>
                  <span>إضافة معلم جديد من الزيارة الميدانية</span>
                </button>
              </div>

              {/* Field visit list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredFieldVisits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-white/20">
                    <ClipboardList className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">لا توجد نتائج</p>
                  </div>
                ) : (
                  filteredFieldVisits.map(poi => (
                    <FieldVisitCard
                      key={poi.id}
                      poi={poi}
                      selected={selectedFieldVisit === poi.id}
                      onReview={p => {
                        setSelectedFieldVisit(p.id);
                        // Opens Add POI form pre-filled (uses same flow for now)
                        onAddPOI();
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            /* ── Normal request list ── */
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-white/20">
                  <MapPin className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">لا توجد طلبات</p>
                </div>
              ) : (
                filtered.map(req => (
                  <RequestCard key={req.id} request={req} onReview={handleReview} selected={selectedRequest === req.id} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
