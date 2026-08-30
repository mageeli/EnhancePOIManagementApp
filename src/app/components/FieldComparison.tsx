import { useState } from "react";
import {
  Check, AlertTriangle, Copy, Edit2,
  CheckCircle, Circle, Minus, ChevronDown, Star,
  Plus, X
} from "lucide-react";
import type { POIRequest, POIData } from "./data";
import { comparisonFields, sourceLabels, googleMapsPOIs } from "./data";

interface FieldComparisonProps {
  request: POIRequest;
  onApprovedValuesChange?: (values: Partial<POIData>) => void;
  // Lifted state from ReviewWorkspace so map clicks stay in sync
  addedGooglePOIIds?: string[];
  activeGooglePOIId?: string;
  onSetAddedGooglePOIIds?: (ids: string[]) => void;
  onSetActiveGooglePOIId?: (id: string) => void;
}

type FieldValue = string | undefined;

function compareValues(a: FieldValue, b: FieldValue) {
  if (!a && !b) return "empty";
  if (!a || !b) return "conflict";
  return a.trim() === b.trim() ? "match" : "conflict";
}

function ValueCell({
  value, isSelected, onSelect,
}: { value: FieldValue; isSelected?: boolean; onSelect?: () => void }) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) navigator.clipboard.writeText(value);
  };
  if (!value) return (
    <div className="flex items-center gap-1.5 py-1.5 px-2 text-white/20">
      <Minus className="w-3 h-3" />
      <span className="text-xs italic">—</span>
    </div>
  );
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-1.5 py-1.5 px-2 rounded cursor-pointer transition-all border ${
        isSelected ? "bg-emerald-500/10 border-emerald-500/30" : "hover:bg-white/[0.04] border-transparent"
      }`}
    >
      <span className={`text-xs flex-1 leading-relaxed min-w-0 break-words ${isSelected ? "text-emerald-300" : "text-white/75"}`}>{value}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={handleCopy} className="w-4 h-4 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10">
          <Copy className="w-2.5 h-2.5" />
        </button>
      </div>
      {isSelected ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-white/15 shrink-0 group-hover:text-white/35" />}
    </div>
  );
}

export function FieldComparison({
  request, onApprovedValuesChange,
  addedGooglePOIIds: extAddedIds,
  activeGooglePOIId: extActiveId,
  onSetAddedGooglePOIIds,
  onSetActiveGooglePOIId,
}: FieldComparisonProps) {
  const [approvedValues, setApprovedValues] = useState<Record<string, { source: string; value: string }>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showOnlyConflicts, setShowOnlyConflicts] = useState(false);
  const [internalAddedIds, setInternalAddedIds] = useState<string[]>([googleMapsPOIs[0].id]);
  const [internalActiveId, setInternalActiveId] = useState(googleMapsPOIs[0].id);
  const [showAddGooglePOI, setShowAddGooglePOI] = useState(false);

  // Use external state if provided (lifted from ReviewWorkspace), else internal
  const addedGooglePOIs = extAddedIds ?? internalAddedIds;
  const activeGooglePOI = extActiveId ?? internalActiveId;
  const setAddedGooglePOIs = (ids: string[]) => { setInternalAddedIds(ids); onSetAddedGooglePOIIds?.(ids); };
  const setActiveGooglePOI = (id: string) => { setInternalActiveId(id); onSetActiveGooglePOIId?.(id); };

  const current = request.currentData;
  const incoming = request.incomingData;
  const activeGoogle = googleMapsPOIs.find(g => g.id === activeGooglePOI);
  const googleData = activeGoogle?.data;

  const getValue = (data: Partial<POIData> | undefined, key: string): FieldValue =>
    data ? (data as Record<string, string>)[key] : undefined;

  const setApproved = (key: string, source: string, value: string) => {
    const next = { ...approvedValues, [key]: { source, value } };
    setApprovedValues(next);
    onApprovedValuesChange?.(Object.fromEntries(Object.entries(next).map(([k, v]) => [k, v.value])) as Partial<POIData>);
  };

  const handleBulkApply = (source: string) => {
    const next = { ...approvedValues };
    comparisonFields.forEach(({ key }) => {
      const data = source === "current" ? current : source === "incoming" ? incoming : googleData;
      const val = getValue(data, key);
      if (val) next[key] = { source, value: val };
    });
    setApprovedValues(next);
  };

  const approvedCount = Object.keys(approvedValues).length;
  const totalFields = comparisonFields.length;
  const missingRequired = comparisonFields.filter(f => f.required && !approvedValues[f.key]).length;

  const filteredFields = showOnlyConflicts
    ? comparisonFields.filter(({ key }) => compareValues(getValue(current, key), getValue(incoming, key)) === "conflict")
    : comparisonFields;

  const availableToAdd = googleMapsPOIs.filter(g => !addedGooglePOIs.includes(g.id));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/8 shrink-0">
        {/* Google Maps POI selector */}
        <div className="mb-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs text-white/40 font-medium">مصادر Google Maps المرجعية</span>
            <span className="text-xs text-white/25">({addedGooglePOIs.length} مصدر)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {addedGooglePOIs.map(gid => {
              const poi = googleMapsPOIs.find(g => g.id === gid);
              if (!poi) return null;
              return (
                <button
                  key={gid}
                  onClick={() => setActiveGooglePOI(gid)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                    activeGooglePOI === gid
                      ? "bg-orange-600/20 border-orange-500/50 text-orange-300"
                      : "bg-white/5 border-white/10 text-white/50 hover:text-white/70"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="max-w-[140px] truncate">{poi.nameAr}</span>
                  <span className="text-amber-400">⭐ {poi.rating}</span>
                  {addedGooglePOIs.length > 1 && (
                    <span
                      onClick={e => { e.stopPropagation(); const next = addedGooglePOIs.filter(id => id !== gid); setAddedGooglePOIs(next); if (activeGooglePOI === gid) setActiveGooglePOI(next[0] || ""); }}
                      className="text-white/20 hover:text-red-400 transition-colors mr-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
            {availableToAdd.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowAddGooglePOI(!showAddGooglePOI)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-dashed border-white/15 text-white/30 hover:text-white/50 hover:border-white/25 text-xs transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  إضافة معلم Google
                </button>
                {showAddGooglePOI && (
                  <div className="absolute top-full mt-1 right-0 z-30 w-56 bg-[#1e2533] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/8">
                      <p className="text-xs text-white/50">معالم Google Maps القريبة</p>
                    </div>
                    {availableToAdd.map(poi => (
                      <button
                        key={poi.id}
                        onClick={() => {
                          setAddedGooglePOIs([...addedGooglePOIs, poi.id]);
                          setActiveGooglePOI(poi.id);
                          setShowAddGooglePOI(false);
                        }}
                        className="w-full px-3 py-2 text-right hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/70 truncate">{poi.nameAr}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span className="text-xs text-white/40">{poi.rating} · {poi.reviews} تقييم</span>
                            </div>
                          </div>
                          <Plus className="w-3 h-3 text-white/30" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress + controls */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(approvedCount / totalFields) * 100}%` }} />
          </div>
          <span className="text-xs text-white/40 tabular-nums">{approvedCount}/{totalFields}</span>
          {missingRequired > 0 && (
            <span className="text-xs text-red-400 flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" />{missingRequired}
            </span>
          )}
          <button
            onClick={() => setShowOnlyConflicts(!showOnlyConflicts)}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${showOnlyConflicts ? "border-amber-500/40 text-amber-300 bg-amber-500/10" : "border-white/10 text-white/40 hover:text-white"}`}
          >
            التعارضات
          </button>
        </div>

        {/* Bulk actions */}
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs text-white/30 self-center">اعتماد الكل من:</span>
          {current && (
            <button onClick={() => handleBulkApply("current")} className="text-xs px-1.5 py-0.5 rounded bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-colors">بلدي+</button>
          )}
          {incoming && (
            <button onClick={() => handleBulkApply("incoming")} className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${request.source === "balady-business" ? "bg-violet-600/20 border-violet-500/30 text-violet-300" : "bg-teal-600/20 border-teal-500/30 text-teal-300"}`}>
              {sourceLabels[request.source]}
            </button>
          )}
          {googleData && (
            <button onClick={() => handleBulkApply("google")} className="text-xs px-1.5 py-0.5 rounded bg-orange-600/20 border border-orange-500/30 text-orange-300 hover:bg-orange-600/30 transition-colors">Google</button>
          )}
          <button className="text-xs px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors">تعبئة الناقص من Google</button>
        </div>
      </div>

      {/* Table header */}
      <div className="grid gap-0 shrink-0 border-b border-white/8" style={{ gridTemplateColumns: "130px 1fr 1fr 1fr 110px" }}>
        {[
          { label: "الحقل", cls: "text-white/35" },
          { label: "بلدي+ الحالية", cls: "text-blue-400/60", dot: "bg-blue-500" },
          { label: sourceLabels[request.source], cls: request.source === "balady-business" ? "text-violet-400/60" : "text-teal-400/60", dot: request.source === "balady-business" ? "bg-violet-500" : "bg-teal-500" },
          { label: activeGoogle?.nameAr || "Google Maps", cls: "text-orange-400/60", dot: "bg-red-500" },
          { label: "المعتمد", cls: "text-emerald-400/60", dot: "bg-emerald-500" },
        ].map((col, i) => (
          <div key={i} className={`px-2 py-2 text-xs font-medium ${col.cls} flex items-center gap-1`}>
            {col.dot && <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />}
            <span className="truncate">{col.label}</span>
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {filteredFields.map(({ key, label, required }) => {
          const cv = getValue(current, key);
          const iv = getValue(incoming, key);
          const gv = getValue(googleData, key);
          const approved = approvedValues[key];
          const hasConflict = compareValues(cv, iv) === "conflict";
          const hasMatch = compareValues(cv, iv) === "match" && !!iv;

          return (
            <div
              key={key}
              className={`grid gap-0 border-b border-white/5 hover:bg-white/[0.015] transition-colors ${hasConflict ? "bg-amber-500/[0.03]" : ""}`}
              style={{ gridTemplateColumns: "130px 1fr 1fr 1fr 110px" }}
            >
              {/* Field name */}
              <div className="px-2 py-2 flex items-start gap-1 border-r border-white/5">
                <span className="text-xs text-white/55">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</span>
                <div className="shrink-0 mt-0.5">
                  {hasConflict && <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />}
                  {hasMatch && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                </div>
              </div>

              {/* Current */}
              <div className="px-0.5 py-0.5 border-r border-white/5">
                <ValueCell value={cv} isSelected={approved?.source === "current"} onSelect={cv ? () => setApproved(key, "current", cv) : undefined} />
              </div>

              {/* Incoming */}
              <div className="px-0.5 py-0.5 border-r border-white/5">
                <ValueCell value={iv} isSelected={approved?.source === "incoming"} onSelect={iv ? () => setApproved(key, "incoming", iv) : undefined} />
              </div>

              {/* Google */}
              <div className="px-0.5 py-0.5 border-r border-white/5">
                <ValueCell value={gv} isSelected={approved?.source === "google"} onSelect={gv ? () => setApproved(key, "google", gv) : undefined} />
              </div>

              {/* Approved */}
              <div className="px-1.5 py-1">
                {editingField === key ? (
                  <div className="flex flex-col gap-0.5">
                    <input
                      value={editValue} onChange={e => setEditValue(e.target.value)}
                      className="w-full text-xs px-1.5 py-1 bg-white/10 border border-white/20 rounded text-white outline-none"
                      autoFocus
                    />
                    <div className="flex gap-0.5">
                      <button onClick={() => { setApproved(key, "manual", editValue); setEditingField(null); }} className="flex-1 text-xs px-1 py-0.5 bg-emerald-600 rounded text-white">حفظ</button>
                      <button onClick={() => setEditingField(null)} className="text-xs px-1 py-0.5 bg-white/10 rounded text-white/50">✕</button>
                    </div>
                  </div>
                ) : approved ? (
                  <div className="flex items-center gap-1 py-1 px-1.5 rounded bg-emerald-500/10 border border-emerald-500/25">
                    <span className="text-xs text-emerald-300 flex-1 truncate">{approved.value}</span>
                    <button onClick={() => { setEditingField(key); setEditValue(approved.value); }} className="text-white/25 hover:text-white">
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setEditingField(key); setEditValue(""); }} className="flex items-center gap-0.5 text-xs text-white/15 hover:text-white/40 py-1 px-1.5 w-full transition-colors">
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-white/8 shrink-0 bg-[#161b27]">
        <div className="flex items-center gap-3 text-xs text-white/35">
          <span><span className="text-emerald-400">{approvedCount}</span> معتمد</span>
          <span><span className="text-white/50">{totalFields - approvedCount}</span> غير محدد</span>
          {missingRequired > 0 && <span className="text-red-400"><AlertTriangle className="w-3 h-3 inline ml-0.5" />{missingRequired} مطلوب</span>}
        </div>
      </div>
    </div>
  );
}
