import { useState, useRef, useCallback, useEffect } from "react";
import {
  X, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle,
  RotateCcw, XCircle, ChevronDown, ChevronUp,
  Camera, Save, GripVertical, Maximize2, Minimize2
} from "lucide-react";
import { MapCanvas } from "./MapCanvas";
import { FieldComparison } from "./FieldComparison";
import type { POIRequest, GoogleMapsPOI } from "./data";
import { statusLabels, statusColors, sourceLabels, sourceColors, requestTypeLabels, googleMapsPOIs } from "./data";
import { FieldSurveyData } from "./FieldSurveyData";

interface ReviewWorkspaceProps {
  request: POIRequest;
  onClose: () => void;
  onApprove: (request: POIRequest) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

function AccordionSection({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/8 rounded-lg overflow-hidden mb-2">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-[#1e2533] hover:bg-[#252d3d] transition-colors text-right">
        <span className="text-sm font-medium text-white">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>
      {open && <div className="px-4 py-3 bg-[#161b27] border-t border-white/8">{children}</div>}
    </div>
  );
}

function DataField({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  if (!value) return (
    <div className="flex gap-2 py-0.5">
      <span className="text-xs text-white/30 w-32 shrink-0">{label}</span>
      <span className="text-xs text-white/20 italic">غير متوفر</span>
    </div>
  );
  return (
    <div className="flex gap-2 py-0.5">
      <span className="text-xs text-white/40 w-32 shrink-0">{label}</span>
      <span className={`text-xs font-medium ${highlight ? "text-amber-300" : "text-white/80"}`}>{value}</span>
    </div>
  );
}

export function ReviewWorkspace({
  request, onClose, onApprove, onNext, onPrev, hasNext, hasPrev
}: ReviewWorkspaceProps) {
  const [activeTool, setActiveTool] = useState("base");
  const [showStreetView, setShowStreetView] = useState(false);
  const [showLens, setShowLens] = useState(false);
  const [activePanel, setActivePanel] = useState<"comparison" | "license" | "survey" | "audit">("comparison");
  const [comment, setComment] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [panelWidth, setPanelWidth] = useState(560);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [panelX, setPanelX] = useState(0);
  const dragStartX = useRef(0);
  const dragStartPanelX = useRef(0);
  const isResizing = useRef(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);
  // Google POIs state — lifted so both MapCanvas and FieldComparison share it
  const [addedGooglePOIIds, setAddedGooglePOIIds] = useState<string[]>([googleMapsPOIs[0].id]);
  const [activeGooglePOIId, setActiveGooglePOIId] = useState<string>(googleMapsPOIs[0].id);

  const isCancellation = request.type === "cancel-license";
  const isAddPlace = request.type === "add-place";
  const isCorrectLocation = request.type === "correct-location";
  const isBusinessRequest = request.source === "balady-business";
  const completionPct = 72;

  // Drag handlers for panel header
  const onDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartPanelX.current = panelX;
  }, [panelX]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isResizing.current) {
        // Resize: dragging left edge changes width (RTL: drag left = wider)
        const delta = resizeStartX.current - e.clientX;
        const newWidth = Math.max(400, Math.min(1100, resizeStartWidth.current + delta));
        setPanelWidth(newWidth);
        return;
      }
      if (isDragging) {
        const delta = dragStartX.current - e.clientX; // RTL: move right
        const newX = Math.max(0, Math.min(600, dragStartPanelX.current + delta));
        setPanelX(newX);
      }
    };
    const onMouseUp = () => {
      setIsDragging(false);
      isResizing.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [isDragging]);

  const onResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    isResizing.current = true;
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = panelWidth;
  };

  const handleToolSelect = (tool: string) => {
    setActiveTool(tool);
    if (tool === "streetview") setShowStreetView(true);
    if (tool === "lens") setShowLens(true);
    if (tool !== "streetview") setShowStreetView(false);
    if (tool !== "lens") setShowLens(false);
  };

  const handleGooglePOIClick = (poi: GoogleMapsPOI) => {
    if (!addedGooglePOIIds.includes(poi.id)) {
      setAddedGooglePOIIds(prev => [...prev, poi.id]);
    }
    setActiveGooglePOIId(poi.id);
    // Switch to comparison tab to show the result
    setActivePanel("comparison");
  };

  const effectiveWidth = isMaximized ? 900 : panelWidth;

  const quickComments = [
    "الصور المرفقة غير واضحة",
    "الإحداثيات لا تتطابق مع العنوان",
    "يرجى توفير صورة اللوحة",
    "البيانات غير مكتملة",
  ];

  const tabs = [
    { id: "comparison" as const, label: "مقارنة البيانات", show: true },
    { id: "license" as const, label: "بيانات الرخصة", show: isBusinessRequest },
    { id: "survey" as const, label: "المسح الميداني", show: true },
    { id: "audit" as const, label: "سجل المراجعة", show: true },
  ].filter(t => t.show);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapCanvas
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
          showStreetView={showStreetView}
          onStreetViewClose={() => { setShowStreetView(false); setActiveTool("base"); }}
          showLens={showLens}
          onLensClose={() => { setShowLens(false); setActiveTool("base"); }}
          onGooglePOIClick={handleGooglePOIClick}
          addedGooglePOIIds={addedGooglePOIIds}
          poiRequest={request}
          onEditPOI={() => setActivePanel("comparison")}
          markers={
            isCorrectLocation
              ? [
                  { lat: request.lat, lng: request.lng, label: "الموقع الحالي", type: "main" },
                  { lat: request.lat + 0.003, lng: request.lng + 0.003, label: "الموقع المقترح", type: "proposed" },
                ]
              : [{ lat: request.lat, lng: request.lng, label: request.poiName, type: "main" }]
          }
        />
      </div>

      {/* Location correction info */}
      {isCorrectLocation && !showStreetView && !showLens && (
        <div className="absolute bottom-20 left-4 z-20 max-w-xs">
          <div className="bg-[#1e2533]/95 backdrop-blur border border-amber-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">طلب تصحيح موقع</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
              <div>
                <div className="flex items-center gap-1 mb-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /><span>الحالي</span></div>
                <p className="text-white/40 font-mono text-xs">{request.currentData?.coordinates}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /><span>المقترح</span></div>
                <p className="text-white/40 font-mono text-xs">{request.incomingData?.coordinates}</p>
              </div>
            </div>
            <p className="text-xs text-white/40 mt-1">المسافة: <span className="text-white/70">~420 م</span></p>
          </div>
        </div>
      )}

      {/* Cancellation warning overlay */}
      {isCancellation && !showStreetView && !showLens && (
        <div className="absolute bottom-4 left-4 z-20">
          <div className="bg-red-900/80 backdrop-blur border border-red-500/40 rounded-lg px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-xs text-red-300">سيتم تغيير المعلم إلى <strong>مغلق</strong> بعد الاعتماد</p>
          </div>
        </div>
      )}

      {/* Keyboard hint */}
      {!showStreetView && !showLens && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-[#161b27]/70 backdrop-blur border border-white/8 rounded px-2 py-1 text-xs text-white/25">
            <span className="font-mono">Ctrl+Enter</span> اعتماد · <span className="font-mono">→ ←</span> التنقل
          </div>
        </div>
      )}

      {/* ── DRAGGABLE REVIEW PANEL ── */}
      {!showStreetView && !showLens && (
        <div
          className="absolute top-0 bottom-0 z-30 flex"
          style={{
            right: `${panelX}px`,
            width: `${effectiveWidth}px`,
            cursor: isDragging ? "grabbing" : "default",
          }}
        >
          {/* Resize handle on left edge */}
          <div
            onMouseDown={onResizeStart}
            className="w-1.5 h-full cursor-ew-resize bg-transparent hover:bg-blue-500/30 transition-colors shrink-0 group flex items-center justify-center"
          >
            <div className="w-0.5 h-16 rounded-full bg-white/20 group-hover:bg-blue-400 transition-colors" />
          </div>

          <div className="flex-1 bg-[#161b27]/97 backdrop-blur-sm border-r border-white/8 flex flex-col overflow-hidden shadow-2xl min-w-0">
            {/* Drag handle header */}
            <div
              onMouseDown={onDragStart}
              className={`px-3 py-2.5 border-b border-white/8 shrink-0 flex flex-col gap-2 select-none ${isDragging ? "cursor-grabbing bg-[#1e2533]" : "cursor-grab hover:bg-[#1a2030]"} transition-colors`}
            >
              {/* Title row */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-white/20 no-drag">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0 no-drag">
                  <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-semibold text-white truncate">{request.poiName}</span>
                </div>
                <div className="flex items-center gap-1 no-drag shrink-0">
                  {hasPrev && <button onClick={onPrev} className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10"><ChevronRight className="w-3.5 h-3.5" /></button>}
                  {hasNext && <button onClick={onNext} className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10"><ChevronLeft className="w-3.5 h-3.5" /></button>}
                  <button onClick={() => setIsMaximized(!isMaximized)} className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10">
                    {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-1 no-drag">
                <span className={`text-xs px-2 py-0.5 rounded border ${sourceColors[request.source]}`}>{sourceLabels[request.source]}</span>
                <span className="text-xs px-2 py-0.5 rounded border border-white/10 bg-white/5 text-white/50">{requestTypeLabels[request.type]}</span>
                <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[request.status]}`}>{statusLabels[request.status]}</span>
                <span className="text-xs px-2 py-0.5 rounded border border-white/10 text-white/25 font-mono">{request.requestId}</span>
              </div>

              {/* Sub-meta */}
              <div className="flex items-center gap-2 text-xs text-white/35 no-drag">
                <span>{request.city} · {request.district}</span>
                {request.licenseNumber && <><span>·</span><span className="font-mono text-white/50">{request.licenseNumber}</span></>}
                <span className="mr-auto">{new Date(request.submittedAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}</span>
              </div>

              {/* Completion */}
              <div className="flex items-center gap-2 no-drag">
                <span className="text-xs text-white/35">اكتمال</span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${completionPct >= 80 ? "bg-emerald-500" : completionPct >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${completionPct}%` }} />
                </div>
                <span className="text-xs text-white/50">{completionPct}%</span>
                <div className="flex items-center gap-1 text-xs text-white/20">
                  <Save className="w-3 h-3" />
                  <span>محفوظ</span>
                </div>
              </div>

              {/* Warnings */}
              {isCancellation && (
                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-red-500/10 border border-red-500/20 no-drag">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <p className="text-xs text-red-300">سيتم تغيير حالة المعلم إلى مغلق بعد الاعتماد.</p>
                </div>
              )}
              {isAddPlace && (
                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-amber-500/10 border border-amber-500/20 no-drag">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-300">تم اكتشاف معلم مشابه على بعد 180م</p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/8 shrink-0">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  className={`flex-1 px-2 py-2 text-xs transition-all border-b-2 ${activePanel === tab.id ? "border-blue-500 text-white bg-blue-500/5" : "border-transparent text-white/40 hover:text-white/70"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {activePanel === "comparison" && (
                <FieldComparison
                  request={request}
                  addedGooglePOIIds={addedGooglePOIIds}
                  activeGooglePOIId={activeGooglePOIId}
                  onSetAddedGooglePOIIds={setAddedGooglePOIIds}
                  onSetActiveGooglePOIId={setActiveGooglePOIId}
                />
              )}

              {activePanel === "survey" && <FieldSurveyData request={request} />}

              {activePanel === "license" && request.licenseData && (
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <AccordionSection title="بيانات المتقدم" defaultOpen>
                    <div className="space-y-1.5">
                      <DataField label="رقم الجوال" value={request.licenseData.applicantPhone} />
                      <DataField label="اسم المنشأة" value={request.licenseData.establishmentName} highlight />
                      <DataField label="الرقم الموحد" value={request.licenseData.unifiedNumber} />
                    </div>
                  </AccordionSection>
                  <AccordionSection title="بيانات النشاط">
                    <div className="space-y-1.5">
                      <DataField label="تصنيف ISIC" value={request.licenseData.isicCategory} />
                      <DataField label="وصف النشاط" value={request.licenseData.activityDescription} />
                      <DataField label="مساحة المحل" value={request.licenseData.shopArea} />
                      <DataField label="نوع المنشأة" value={request.licenseData.establishmentType} />
                    </div>
                  </AccordionSection>
                  <AccordionSection title="البيانات الجغرافية">
                    <div className="space-y-1.5">
                      <DataField label="المنطقة" value={request.licenseData.region} />
                      <DataField label="المدينة" value={request.licenseData.city} />
                      <DataField label="الحي" value={request.licenseData.district} />
                      <DataField label="الأمانة" value={request.licenseData.municipality} />
                      <DataField label="رقم الأرض" value={request.licenseData.landNumber} />
                      <DataField label="اسم الشارع" value={request.licenseData.streetName} />
                      <DataField label="الإحداثيات" value={request.licenseData.coordinates} />
                    </div>
                  </AccordionSection>
                  <AccordionSection title="بيانات المحل واللوحة">
                    <div className="space-y-1.5">
                      <DataField label="العلامة التجارية" value={request.licenseData.brandName} />
                      <DataField label="الاسم الرسمي" value={request.licenseData.officialName} highlight />
                      <DataField label="اسم اللوحة" value={request.licenseData.signageName} />
                      <DataField label="رقم المحل" value={request.licenseData.shopNumber} />
                      <DataField label="عدد المداخل" value={request.licenseData.entrancesCount} />
                      <DataField label="نوع اللوحة" value={request.licenseData.signageType} />
                      <DataField label="مساحة اللوحات" value={request.licenseData.totalSignageArea} />
                    </div>
                  </AccordionSection>
                  <AccordionSection title="المرفقات">
                    <div className="grid grid-cols-3 gap-2">
                      {["صورة اللوحة", "صور خارجية", "صور داخلية"].map(att => (
                        <div key={att} className="aspect-square bg-[#1e2533] rounded border border-white/10 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white/5 transition-colors">
                          <Camera className="w-5 h-5 text-white/20" />
                          <span className="text-xs text-white/30 text-center px-1">{att}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionSection>
                </div>
              )}

              {activePanel === "audit" && (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3 mb-4">
                    {[
                      { action: "إرسال الطلب", by: "بلدي أعمال (منظومة)", at: "2024-06-10 09:23", type: "submit" },
                      { action: "استلام وتوزيع الطلب", by: "النظام التلقائي", at: "2024-06-10 09:23", type: "system" },
                      { action: "بدء المراجعة", by: "أحمد العمري (موظف)", at: "2024-06-10 10:45", type: "review" },
                    ].map((entry, i, arr) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full mt-1 ${entry.type === "submit" ? "bg-blue-500" : entry.type === "system" ? "bg-gray-500" : "bg-emerald-500"}`} />
                          {i < arr.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                        </div>
                        <div className="pb-3">
                          <p className="text-xs text-white/70 font-medium">{entry.action}</p>
                          <p className="text-xs text-white/40 mt-0.5">{entry.by}</p>
                          <p className="text-xs text-white/25 mt-0.5 font-mono">{entry.at}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <label className="text-xs text-white/40 block mb-2">ملاحظات الموظف</label>
                  <textarea
                    value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="أضف ملاحظة..." rows={3}
                    className="w-full text-xs px-3 py-2 bg-[#1e2533] border border-white/10 rounded-lg text-white/70 placeholder-white/20 outline-none focus:border-blue-500/50 resize-none" dir="rtl"
                  />
                  <div className="mt-2 flex flex-wrap gap-1">
                    {quickComments.map(qc => (
                      <button key={qc} onClick={() => setComment(qc)} className="text-xs px-2 py-1 rounded bg-white/5 border border-white/8 text-white/40 hover:text-white/60 transition-colors">{qc}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action footer */}
            <div className="px-4 py-3 border-t border-white/8 shrink-0 bg-[#111827]">
              <div className="flex gap-2 mb-2">
                <button onClick={() => setShowReturnModal(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                  طلب تعديل
                </button>
                <button onClick={() => setShowRejectModal(true)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 text-xs transition-colors">
                  <XCircle className="w-3.5 h-3.5" />
                  رفض
                </button>
              </div>
              <button
                onClick={() => onApprove(request)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-lg shadow-blue-600/20"
              >
                <CheckCircle className="w-4 h-4" />
                اعتماد ونشر إلى بلدي+
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return modal */}
      {showReturnModal && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="w-96 bg-[#1e2533] border border-white/10 rounded-xl shadow-2xl">
            <div className="px-5 py-4 border-b border-white/8"><h3 className="text-white font-semibold text-sm">طلب تعديل من المستفيد</h3></div>
            <div className="p-5 space-y-3">
              <label className="text-xs text-white/50 block">سبب طلب التعديل *</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="اذكر سبب إعادة الطلب..." rows={4}
                className="w-full text-sm px-3 py-2 bg-[#161b27] border border-white/10 rounded-lg text-white/70 placeholder-white/25 outline-none focus:border-amber-500/50 resize-none" dir="rtl" />
              <div className="flex flex-wrap gap-1">
                {["الصور غير واضحة", "البيانات ناقصة", "الإحداثيات غير دقيقة"].map(r => (
                  <button key={r} onClick={() => setRejectReason(r)} className="text-xs px-2 py-1 rounded bg-white/5 border border-white/8 text-white/40 hover:text-white/60">{r}</button>
                ))}
              </div>
            </div>
            <div className="px-5 py-3 border-t border-white/8 flex justify-end gap-2">
              <button onClick={() => setShowReturnModal(false)} className="px-4 py-2 text-xs text-white/50 hover:text-white">إلغاء</button>
              <button disabled={!rejectReason} className="px-4 py-2 text-xs bg-amber-500 hover:bg-amber-600 text-black rounded-lg disabled:opacity-40 transition-colors">إرسال للمستفيد</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="w-96 bg-[#1e2533] border border-white/10 rounded-xl shadow-2xl">
            <div className="px-5 py-4 border-b border-white/8"><h3 className="text-white font-semibold text-sm">رفض الطلب</h3></div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-300">سيتم إشعار المستفيد برفض طلبه</p>
              </div>
              <label className="text-xs text-white/50 block">سبب الرفض *</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="اذكر سبب الرفض..." rows={4}
                className="w-full text-sm px-3 py-2 bg-[#161b27] border border-white/10 rounded-lg text-white/70 placeholder-white/25 outline-none focus:border-red-500/50 resize-none" dir="rtl" />
            </div>
            <div className="px-5 py-3 border-t border-white/8 flex justify-end gap-2">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-xs text-white/50 hover:text-white">إلغاء</button>
              <button disabled={!rejectReason} className="px-4 py-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-40 transition-colors">تأكيد الرفض</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
