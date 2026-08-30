import { useState, useRef, useCallback, useEffect } from "react";
import {
  MapPin, Import, Check, ChevronDown, ChevronUp, Plus, X,
  Camera, Save, Eye, CheckCircle, GripVertical, Maximize2, Minimize2, Star
} from "lucide-react";
import { MapCanvas } from "./MapCanvas";

interface AddPOIScreenProps {
  onClose: () => void;
  onSave: () => void;
}

function FormSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/8 rounded-lg overflow-hidden mb-3">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#1e2533] hover:bg-[#252d3d] transition-colors text-right">
        <span className="text-sm font-medium text-white">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>
      {open && (
        <div className="px-4 py-4 bg-[#161b27] border-t border-white/8 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

function FormField({ label, type = "text", placeholder, required, imported, value, onChange }: {
  label: string; type?: string; placeholder?: string;
  required?: boolean; imported?: boolean; value?: string; onChange?: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <label className="text-xs text-white/50">{label}</label>
        {required && <span className="text-red-400 text-xs">*</span>}
        {imported && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-orange-300">
            من Google
          </span>
        )}
      </div>
      <input
        type={type} placeholder={placeholder} value={value || ""}
        onChange={e => onChange?.(e.target.value)}
        className={`w-full px-3 py-2 bg-[#1e2533] border rounded-lg text-sm text-white/80 placeholder-white/20 outline-none focus:border-blue-500/50 transition-colors ${imported ? "border-orange-500/30" : "border-white/10"}`}
        dir="rtl"
      />
    </div>
  );
}

function CheckboxField({ label, checked, onChange }: {
  label: string; checked?: boolean; onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div onClick={() => onChange?.(!checked)}
        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? "bg-blue-600 border-blue-500" : "border-white/20 bg-white/5 group-hover:border-white/40"}`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">{label}</span>
    </label>
  );
}

const mockGooglePOIs = [
  { name: "مطعم الوادي العربي", category: "مطعم", rating: 4.2, phone: "0114567890", address: "شارع العروبة، العليا" },
  { name: "كافيه كوفي تايم", category: "كافيه", rating: 3.8, phone: "0551122334", address: "شارع العروبة، العليا" },
  { name: "بقالة الخير", category: "بقالة", rating: 4.0, phone: "0509876543", address: "شارع العروبة، العليا" },
];

export function AddPOIScreen({ onClose, onSave }: AddPOIScreenProps) {
  const [showGoogleImport, setShowGoogleImport] = useState(false);
  const [selectedGooglePOI, setSelectedGooglePOI] = useState<number | null>(null);
  const [importedFields, setImportedFields] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [amenities, setAmenities] = useState<Record<string, boolean>>({});
  const [workDays, setWorkDays] = useState<Record<string, boolean>>({
    sat: true, sun: true, mon: true, tue: true, wed: true, thu: true, fri: false,
  });
  const [is24h, setIs24h] = useState(false);

  // Drag / resize state — mirrors ReviewWorkspace
  const [panelWidth, setPanelWidth] = useState(480);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [panelX, setPanelX] = useState(0);
  const dragStartX = useRef(0);
  const dragStartPanelX = useRef(0);
  const isResizing = useRef(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  const setField = (key: string, val: string) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleImportConfirm = () => {
    if (selectedGooglePOI === null) return;
    const poi = mockGooglePOIs[selectedGooglePOI];
    setFormData(prev => ({ ...prev, nameAr: poi.name, phone: poi.phone, address: poi.address }));
    setImportedFields({ nameAr: true, phone: true, address: true });
    setShowGoogleImport(false);
  };

  const dayLabels: Record<string, string> = {
    sat: "السبت", sun: "الأحد", mon: "الاثنين", tue: "الثلاثاء",
    wed: "الأربعاء", thu: "الخميس", fri: "الجمعة",
  };

  // Drag handlers
  const onDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartPanelX.current = panelX;
  }, [panelX]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isResizing.current) {
        const delta = resizeStartX.current - e.clientX;
        const newWidth = Math.max(380, Math.min(900, resizeStartWidth.current + delta));
        setPanelWidth(newWidth);
        return;
      }
      if (isDragging) {
        const delta = dragStartX.current - e.clientX;
        const newX = Math.max(0, Math.min(600, dragStartPanelX.current + delta));
        setPanelX(newX);
      }
    };
    const onMouseUp = () => { setIsDragging(false); isResizing.current = false; };
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

  const effectiveWidth = isMaximized ? 720 : panelWidth;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapCanvas />
      </div>

      {/* Location hint */}
      <div className="absolute bottom-8 left-14 z-10 pointer-events-none">
        <div className="bg-[#161b27]/80 backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-xs text-white/40">
          <MapPin className="w-3.5 h-3.5 inline ml-1 text-blue-400" />
          انقر على الخريطة لتحديد الموقع
        </div>
      </div>

      {/* ── FLOATING FORM PANEL (same pattern as ReviewWorkspace) ── */}
      <div
        className="absolute top-0 bottom-0 z-30 flex"
        style={{ right: `${panelX}px`, width: `${effectiveWidth}px`, cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* Resize handle */}
        <div onMouseDown={onResizeStart}
          className="w-1.5 h-full cursor-ew-resize bg-transparent hover:bg-blue-500/30 transition-colors shrink-0 group flex items-center justify-center">
          <div className="w-0.5 h-16 rounded-full bg-white/20 group-hover:bg-blue-400 transition-colors" />
        </div>

        <div className="flex-1 bg-[#161b27]/97 backdrop-blur-sm border-r border-white/8 flex flex-col overflow-hidden shadow-2xl min-w-0">
          {/* Drag-handle header */}
          <div
            onMouseDown={onDragStart}
            className={`px-3 py-3 border-b border-white/8 shrink-0 select-none ${isDragging ? "cursor-grabbing bg-[#1e2533]" : "cursor-grab hover:bg-[#1a2030]"} transition-colors`}
          >
            <div className="flex items-center gap-2">
              <div className="text-white/20 no-drag">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 flex-1 no-drag">
                <button onClick={onClose}
                  className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
                <h2 className="text-sm font-semibold text-white">إضافة نقطة اهتمام جديدة</h2>
              </div>
              <div className="flex items-center gap-1 no-drag shrink-0">
                <button
                  onClick={() => setShowGoogleImport(true)}
                  className="flex items-center gap-1 px-2 py-1.5 bg-orange-600/20 border border-orange-500/30 text-orange-300 hover:bg-orange-600/30 text-xs rounded-lg transition-colors"
                >
                  <Import className="w-3 h-3" />
                  استيراد Google
                </button>
                <button onClick={() => setIsMaximized(!isMaximized)}
                  className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10">
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Form content */}
          <div className="flex-1 overflow-y-auto p-4">
            <FormSection title="المعلومات الأساسية">
              <FormField label="اسم المعلم بالعربية" placeholder="أدخل الاسم بالعربية" required imported={importedFields.nameAr} value={formData.nameAr} onChange={v => setField("nameAr", v)} />
              <FormField label="اسم المعلم بالإنجليزية" placeholder="Enter name in English" value={formData.nameEn} onChange={v => setField("nameEn", v)} />
              <FormField label="اسم العلامة التجارية" placeholder="اختياري" value={formData.brandName} onChange={v => setField("brandName", v)} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 block mb-1">التصنيف الرئيسي <span className="text-red-400">*</span></label>
                  <select className="w-full px-3 py-2 bg-[#1e2533] border border-white/10 rounded-lg text-sm text-white/70 outline-none" dir="rtl">
                    <option value="">اختر...</option>
                    <option>مطاعم وكافيهات</option>
                    <option>صحة وطب</option>
                    <option>تسوق</option>
                    <option>تقنية واتصالات</option>
                    <option>فنادق وإقامة</option>
                    <option>تعليم</option>
                    <option>خدمات حكومية</option>
                    <option>ترفيه وسياحة</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1">التصنيف التفصيلي</label>
                  <select className="w-full px-3 py-2 bg-[#1e2533] border border-white/10 rounded-lg text-sm text-white/70 outline-none" dir="rtl">
                    <option value="">اختر...</option>
                    <option>مطعم عربي</option>
                    <option>مطعم بيتزا</option>
                    <option>كافيه</option>
                  </select>
                </div>
              </div>
              <FormField label="وصف مختصر" placeholder="وصف مختصر للمعلم" />
            </FormSection>

            <FormSection title="الموقع والعنوان">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs text-blue-300 font-medium">تحديد الموقع من الخريطة</p>
                  <p className="text-xs text-white/40">انقر على الخريطة لتحديد الإحداثيات</p>
                </div>
              </div>
              <FormField label="الإحداثيات" placeholder="24.7136, 46.6753" value={formData.coordinates} onChange={v => setField("coordinates", v)} />
              <div className="grid grid-cols-2 gap-3">
                <FormField label="المنطقة" placeholder="منطقة الرياض" required />
                <FormField label="المدينة" placeholder="الرياض" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="الحي" placeholder="العليا" required />
                <FormField label="الشارع" placeholder="شارع العروبة" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="رقم المبنى" placeholder="3421" />
                <FormField label="الرقم المختصر" placeholder="7512" />
              </div>
              <FormField label="العنوان الكامل" placeholder="أدخل العنوان التفصيلي" imported={importedFields.address} value={formData.address} onChange={v => setField("address", v)} />
            </FormSection>

            <FormSection title="معلومات التواصل" defaultOpen={false}>
              <FormField label="رقم الجوال" type="tel" placeholder="05xxxxxxxx" imported={importedFields.phone} value={formData.phone} onChange={v => setField("phone", v)} />
              <FormField label="WhatsApp" type="tel" placeholder="05xxxxxxxx" />
              <FormField label="البريد الإلكتروني" type="email" placeholder="info@example.com" />
              <FormField label="الموقع الإلكتروني" placeholder="www.example.com" />
            </FormSection>

            <FormSection title="ساعات العمل" defaultOpen={false}>
              <div className="flex flex-wrap gap-1 mb-3">
                {Object.entries(dayLabels).map(([key, label]) => (
                  <button key={key} onClick={() => setWorkDays(prev => ({ ...prev, [key]: !prev[key] }))}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${workDays[key] ? "bg-blue-600 border-blue-500 text-white" : "border-white/15 text-white/40 hover:text-white/60"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <div onClick={() => setIs24h(!is24h)}
                  className={`w-4 h-4 rounded border flex items-center justify-center ${is24h ? "bg-blue-600 border-blue-500" : "border-white/20"}`}>
                  {is24h && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs text-white/60">مفتوح 24 ساعة</span>
              </label>
              {!is24h && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-white/40 block mb-1">وقت الفتح</label>
                    <input type="time" defaultValue="07:00" className="w-full px-2 py-1.5 bg-[#1e2533] border border-white/10 rounded text-sm text-white/70 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 block mb-1">وقت الإغلاق</label>
                    <input type="time" defaultValue="23:00" className="w-full px-2 py-1.5 bg-[#1e2533] border border-white/10 rounded text-sm text-white/70 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 block mb-1">الاستراحة</label>
                    <input type="time" defaultValue="13:00" className="w-full px-2 py-1.5 bg-[#1e2533] border border-white/10 rounded text-sm text-white/70 outline-none" dir="ltr" />
                  </div>
                </div>
              )}
            </FormSection>

            <FormSection title="الخدمات والمرافق" defaultOpen={false}>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { key: "payment_cash", label: "نقد" }, { key: "payment_card", label: "بطاقة ائتمان" },
                  { key: "payment_mada", label: "مدى" }, { key: "parking", label: "مواقف سيارات" },
                  { key: "valet", label: "صف السيارات" }, { key: "accessibility", label: "سهولة وصول ذوي الإعاقة" },
                  { key: "restrooms", label: "دورة مياه" }, { key: "prayer", label: "مصلى" },
                  { key: "wifi", label: "Wi-Fi" }, { key: "reservation", label: "حجز مسبق" },
                  { key: "drivethru", label: "Drive-Through" }, { key: "kids", label: "منطقة أطفال" },
                ].map(({ key, label }) => (
                  <CheckboxField key={key} label={label} checked={amenities[key]} onChange={v => setAmenities(prev => ({ ...prev, [key]: v }))} />
                ))}
              </div>
            </FormSection>

            <FormSection title="الصور والمرفقات" defaultOpen={false}>
              {["صورة اللوحة الخارجية", "الصور الخارجية", "الصور الداخلية"].map(type => (
                <div key={type}>
                  <label className="text-xs text-white/50 block mb-2">{type}</label>
                  <div className="flex gap-2">
                    <div className="w-20 h-16 bg-[#1e2533] border border-dashed border-white/15 rounded flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition-colors">
                      <Camera className="w-5 h-5 text-white/20" />
                      <span className="text-xs text-white/20 mt-1">رفع</span>
                    </div>
                    <div className="w-20 h-16 bg-[#1e2533] border border-dashed border-white/15 rounded flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition-colors">
                      <Plus className="w-5 h-5 text-white/20" />
                    </div>
                  </div>
                </div>
              ))}
            </FormSection>

            <FormSection title="معلومات إضافية حسب التصنيف" defaultOpen={false}>
              <div className="p-3 bg-[#1e2533] rounded-lg border border-white/8 mb-3">
                <p className="text-xs text-white/40">مخصصة للمطاعم والكافيهات</p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {["جلسات عائلية", "جلسات للمجموعات", "بث المباريات", "توصيل فقط"].map(item => (
                  <CheckboxField key={item} label={item} />
                ))}
              </div>
              <FormField label="رابط قائمة الطعام" placeholder="www.example.com/menu" />
            </FormSection>
          </div>

          {/* Footer actions */}
          <div className="px-4 py-3 border-t border-white/8 shrink-0 bg-[#111827]">
            <div className="flex gap-2">
              <button onClick={onClose}
                className="px-3 py-2 text-xs text-white/40 hover:text-white border border-white/10 rounded-lg transition-colors">
                إلغاء
              </button>
              <button className="px-3 py-2 text-xs text-white/60 hover:text-white border border-white/10 rounded-lg flex items-center gap-1.5 transition-colors">
                <Save className="w-3.5 h-3.5" />
                مسودة
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 text-xs transition-colors">
                <Eye className="w-3.5 h-3.5" />
                معاينة
              </button>
              <button onClick={onSave}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs transition-colors shadow-lg shadow-blue-600/20">
                <CheckCircle className="w-3.5 h-3.5" />
                إضافة واعتماد
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Google Import Modal */}
      {showGoogleImport && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="w-[480px] bg-[#1e2533] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">استيراد بيانات من Google Maps</h3>
              <button onClick={() => setShowGoogleImport(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-white/40 mb-3">المعالم القريبة في Google Maps:</p>
              <div className="space-y-2 mb-4">
                {mockGooglePOIs.map((poi, i) => (
                  <div key={i} onClick={() => setSelectedGooglePOI(i)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedGooglePOI === i ? "border-blue-500/60 bg-blue-600/10" : "border-white/8 bg-[#161b27] hover:border-white/15"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white font-medium">{poi.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 border border-orange-500/20">{poi.category}</span>
                    </div>
                    <p className="text-xs text-white/40">{poi.address}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{poi.rating}</span>
                      <span>{poi.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
              {selectedGooglePOI !== null && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-3">
                  <p className="text-xs text-orange-300 font-medium mb-2">الحقول التي سيتم استيرادها:</p>
                  <div className="space-y-1">
                    {["اسم المعلم بالعربية", "رقم الجوال", "العنوان"].map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs text-white/60">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-white/8 flex justify-end gap-2">
              <button onClick={() => setShowGoogleImport(false)} className="px-4 py-2 text-xs text-white/50 hover:text-white">إلغاء</button>
              <button disabled={selectedGooglePOI === null} onClick={handleImportConfirm}
                className="px-4 py-2 text-xs bg-orange-500 hover:bg-orange-600 text-black rounded-lg disabled:opacity-40 transition-colors font-medium">
                استيراد البيانات المحددة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
