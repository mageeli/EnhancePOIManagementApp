import { useState } from "react";
import {
  MapPin, Navigation, ZoomIn, ZoomOut, Satellite,
  Camera, Map, Building2, Ruler, RefreshCcw,
  ChevronLeft, ChevronRight, X, Play, RotateCw, Eye, Star,
  Maximize2, Minimize2, Phone, Globe, Clock, Tag, Edit2,
  GitCompare, ExternalLink, Layers
} from "lucide-react";
import { googleMapsPOIs } from "./data";
import type { GoogleMapsPOI, POIRequest } from "./data";

const SATELLITE_URL = "https://images.unsplash.com/photo-1674386491555-5b92161e4d04?w=1600&h=900&fit=crop&auto=format";
const STREET_URL = "https://images.unsplash.com/photo-1674388609520-a53102671d89?w=1400&h=700&fit=crop&auto=format";
const STREET_URL_2 = "https://images.unsplash.com/photo-1492763204268-fa0b1a55f143?w=1400&h=700&fit=crop&auto=format";

const LENS_PHOTOS = [
  { url: "https://images.unsplash.com/photo-1492763204268-fa0b1a55f143?w=800&h=450&fit=crop&auto=format", date: "15 مارس 2024", angle: 45, dist: 28 },
  { url: "https://images.unsplash.com/photo-1674386491555-5b92161e4d04?w=800&h=450&fit=crop&auto=format", date: "10 فبراير 2024", angle: 180, dist: 62 },
  { url: "https://images.unsplash.com/photo-1738410775719-9f237adb266d?w=800&h=450&fit=crop&auto=format", date: "02 يناير 2024", angle: 270, dist: 95 },
];

interface MapMarker {
  lat: number; lng: number; label: string;
  type?: "main" | "proposed" | "nearby" | "lens";
}

interface MapCanvasProps {
  markers?: MapMarker[];
  onToolSelect?: (tool: string) => void;
  activeTool?: string;
  showStreetView?: boolean;
  onStreetViewClose?: () => void;
  showLens?: boolean;
  onLensClose?: () => void;
  onGooglePOIClick?: (poi: GoogleMapsPOI) => void;
  addedGooglePOIIds?: string[];
  poiRequest?: POIRequest;
  onEditPOI?: () => void;
}

function BuildingBoundary() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
      <polygon points="45%,40% 58%,38% 60%,52% 47%,54%"
        fill="rgba(59,130,246,0.12)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3" />
      <polygon points="32%,44% 43%,42% 44%,56% 33%,57%"
        fill="rgba(251,191,36,0.08)" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4,3" />
      <text x="52%" y="47%" textAnchor="middle" fill="#93c5fd" fontSize="10" fontFamily="Cairo, sans-serif">المبنى المحدد</text>
      <text x="52%" y="50%" textAnchor="middle" fill="#60a5fa" fontSize="9" fontFamily="Cairo, sans-serif">450 م²</text>
    </svg>
  );
}

function MapGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0d1117 0%, #111827 50%, #0d1117 100%)" }} />
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern id="g1" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#374151" strokeWidth="0.5" />
          </pattern>
          <pattern id="g2" width="300" height="300" patternUnits="userSpaceOnUse">
            <path d="M 300 0 L 0 0 0 300" fill="none" stroke="#4b5563" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)" />
        <rect width="100%" height="100%" fill="url(#g2)" />
      </svg>
      <svg className="absolute inset-0 w-full h-full">
        <line x1="0" y1="45%" x2="100%" y2="45%" stroke="#1f2937" strokeWidth="14" />
        <line x1="0" y1="65%" x2="100%" y2="65%" stroke="#1f2937" strokeWidth="8" />
        <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#1f2937" strokeWidth="12" />
        <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#1f2937" strokeWidth="8" />
        <line x1="0" y1="28%" x2="100%" y2="24%" stroke="#1f2937" strokeWidth="5" />
        <line x1="0" y1="78%" x2="100%" y2="82%" stroke="#1f2937" strokeWidth="5" />
        <line x1="50%" y1="0" x2="55%" y2="100%" stroke="#1f2937" strokeWidth="5" />
        <line x1="16%" y1="0" x2="16%" y2="100%" stroke="#1f2937" strokeWidth="4" />
        <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#1f2937" strokeWidth="4" />
        <text x="50%" y="44%" textAnchor="middle" fill="#374151" fontSize="9" fontFamily="Cairo">شارع العروبة</text>
        <text x="28%" y="35%" textAnchor="middle" fill="#374151" fontSize="8" fontFamily="Cairo" transform="rotate(-90 28% 35%)">طريق الملك فهد</text>
        <rect x="5%" y="5%" width="10%" height="18%" fill="#161b27" stroke="#1f2937" strokeWidth="1" rx="2" />
        <rect x="17%" y="5%" width="8%" height="12%" fill="#161b27" stroke="#1f2937" strokeWidth="1" rx="2" />
        <rect x="5%" y="26%" width="12%" height="10%" fill="#1e2533" stroke="#1f2937" strokeWidth="1" rx="2" />
        <rect x="32%" y="5%" width="28%" height="36%" fill="#161b27" stroke="#1f2937" strokeWidth="1" rx="2" />
        <rect x="66%" y="5%" width="14%" height="35%" fill="#161b27" stroke="#1f2937" strokeWidth="1" rx="2" />
        <rect x="82%" y="8%" width="14%" height="30%" fill="#1e2533" stroke="#1f2937" strokeWidth="1" rx="2" />
        <rect x="5%" y="48%" width="18%" height="12%" fill="#161b27" stroke="#1f2937" strokeWidth="1" rx="2" />
        <rect x="5%" y="62%" width="8%" height="15%" fill="#1e2533" stroke="#374151" strokeWidth="1" rx="2" />
        <rect x="32%" y="48%" width="26%" height="12%" fill="#161b27" stroke="#1f2937" strokeWidth="1" rx="2" />
        <rect x="32%" y="62%" width="14%" height="20%" fill="#1e2533" stroke="#1f2937" strokeWidth="1" rx="2" />
        <rect x="48%" y="62%" width="10%" height="20%" fill="#161b27" stroke="#1f2937" strokeWidth="1" rx="2" />
        <rect x="66%" y="48%" width="28%" height="45%" fill="#161b27" stroke="#1f2937" strokeWidth="1" rx="2" />
        <rect x="5%" y="80%" width="26%" height="15%" fill="#161b27" stroke="#1f2937" strokeWidth="1" rx="2" />
      </svg>
    </div>
  );
}

const mapTools = [
  { id: "base", icon: Map, label: "الخريطة الأساسية" },
  { id: "satellite", icon: Satellite, label: "صور الأقمار الصناعية" },
  { id: "streetview", icon: Camera, label: "Street View" },
  { id: "lens", icon: Eye, label: "عدسة بلدي" },
  { id: "google", icon: Map, label: "Google Maps" },
  { id: "boundaries", icon: Building2, label: "حدود المبنى" },
  { id: "measure", icon: Ruler, label: "قياس المسافة" },
  { id: "recenter", icon: RefreshCcw, label: "إعادة تمركز" },
];

// Compass heading ring component
function CompassRing({ heading }: { heading: number }) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return (
    <div className="relative w-16 h-16">
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {dirs.map((d, i) => {
          const angle = (i * 45 - heading) * (Math.PI / 180);
          const r = d.length === 1 ? 22 : 19;
          const x = 32 + r * Math.sin(angle);
          const y = 32 - r * Math.cos(angle);
          return (
            <text key={d} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fill={d === "N" ? "#ef4444" : "rgba(255,255,255,0.5)"}
              fontSize={d.length === 1 ? "8" : "6"} fontWeight={d === "N" ? "bold" : "normal"}>
              {d}
            </text>
          );
        })}
        {/* Heading arrow */}
        <line x1="32" y1="32" x2="32" y2="8" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <polygon points="32,4 29,12 35,12" fill="#3b82f6" />
        <circle cx="32" cy="32" r="3" fill="white" />
      </svg>
    </div>
  );
}

export function MapCanvas({
  markers = [],
  activeTool: externalTool,
  onToolSelect,
  showStreetView: extStreetView,
  onStreetViewClose,
  showLens: extLens,
  onLensClose,
  onGooglePOIClick,
  addedGooglePOIIds = [],
  poiRequest,
  onEditPOI,
}: MapCanvasProps) {
  const [internalTool, setInternalTool] = useState("base");
  const activeTool = externalTool ?? internalTool;
  const [zoom, setZoom] = useState(15);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [hoveredPOI, setHoveredPOI] = useState<string | null>(null);
  const [satOpacity, setSatOpacity] = useState(100);
  const [lensPhoto, setLensPhoto] = useState(0);
  const [lensFullscreen, setLensFullscreen] = useState(false);
  const [streetFullscreen, setStreetFullscreen] = useState(false);
  const [streetHeading, setStreetHeading] = useState(45);
  const [streetScene, setStreetScene] = useState(0);
  const [showMarkerPopup, setShowMarkerPopup] = useState(false);

  const satellite = activeTool === "satellite";
  const showBoundaries = activeTool === "boundaries";
  const showStreetView = extStreetView ?? activeTool === "streetview";
  const showLens = extLens ?? activeTool === "lens";
  const showGoogleLayer = activeTool === "google";

  const handleToolClick = (id: string) => { setInternalTool(id); onToolSelect?.(id); };

  const streetScenes = [STREET_URL, STREET_URL_2];

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0d1117]">
      <MapGrid />

      {/* Satellite */}
      {satellite && (
        <div className="absolute inset-0" style={{ zIndex: 5, opacity: satOpacity / 100 }}>
          <img src={SATELLITE_URL} alt="صور الأقمار الصناعية" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-green-950/20" />
        </div>
      )}
      {satellite && (
        <div className="absolute bottom-12 left-16 z-20 bg-[#161b27]/90 backdrop-blur border border-white/10 rounded-lg px-3 py-2">
          <div className="flex items-center gap-3">
            <Layers className="w-3.5 h-3.5 text-white/40" />
            <span className="text-xs text-white/50">شفافية الطبقة</span>
            <input type="range" min={0} max={100} value={satOpacity}
              onChange={e => setSatOpacity(+e.target.value)} className="w-28 accent-blue-500 h-1" />
            <span className="text-xs text-white/70 w-8">{satOpacity}%</span>
          </div>
        </div>
      )}

      {/* Google Maps layer */}
      {showGoogleLayer && (
        <div className="absolute inset-0" style={{ zIndex: 5 }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1a2535 0%, #152030 100%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-40">
            <defs>
              <pattern id="gg1" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2a3f55" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gg1)" />
            <line x1="0" y1="45%" x2="100%" y2="45%" stroke="#1e3a2f" strokeWidth="14" />
            <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#1e3a2f" strokeWidth="12" />
            <rect x="32%" y="5%" width="28%" height="36%" fill="#1a2535" stroke="#2a4060" strokeWidth="1" rx="2" />
            <rect x="66%" y="5%" width="14%" height="35%" fill="#1a2535" stroke="#2a4060" strokeWidth="1" rx="2" />
          </svg>
          {googleMapsPOIs.map(poi => {
            const isAdded = addedGooglePOIIds.includes(poi.id);
            const isHovered = hoveredPOI === poi.id;
            return (
              <div key={poi.id} className="absolute z-20 cursor-pointer"
                style={{ left: poi.mapX, top: poi.mapY, transform: "translate(-50%,-100%)" }}
                onMouseEnter={() => setHoveredPOI(poi.id)}
                onMouseLeave={() => setHoveredPOI(null)}
                onClick={() => onGooglePOIClick?.(poi)}>
                <div className="flex flex-col items-center group">
                  {isHovered && (
                    <div className="absolute bottom-full mb-1 bg-[#1e2533] border border-white/15 rounded-lg px-3 py-2 shadow-xl z-30 pointer-events-none"
                      style={{ transform: "translateX(-50%)", left: "50%", width: "180px" }}>
                      <p className="text-xs font-medium text-white mb-0.5">{poi.nameAr}</p>
                      <p className="text-xs text-white/40">{poi.category}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-amber-400">{poi.rating}</span>
                        <span className="text-xs text-white/30">({poi.reviews} تقييم)</span>
                      </div>
                      <div className={`mt-1.5 text-xs text-center py-0.5 rounded ${isAdded ? "text-emerald-400" : "text-blue-400"}`}>
                        {isAdded ? "✓ مضاف للمقارنة" : "اضغط للإضافة"}
                      </div>
                    </div>
                  )}
                  <div className={`px-2 py-1 rounded-full border-2 shadow-lg text-xs font-medium transition-all ${
                    isAdded ? "bg-emerald-500 border-white text-white scale-110"
                    : isHovered ? "bg-red-400 border-white text-white scale-110"
                    : "bg-red-500 border-white text-white"}`}>
                    {poi.nameAr.split(" ").slice(0, 2).join(" ")}
                  </div>
                  <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `7px solid ${isAdded ? "#10b981" : "#ef4444"}` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Building boundaries */}
      {showBoundaries && <BuildingBoundary />}

      {/* Measurement */}
      {activeTool === "measure" && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <line x1="35%" y1="50%" x2="55%" y2="48%" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6,3" />
          <circle cx="35%" cy="50%" r="5" fill="#fbbf24" />
          <circle cx="55%" cy="48%" r="5" fill="#fbbf24" />
          <text x="45%" y="46%" textAnchor="middle" fill="#fbbf24" fontSize="11" fontFamily="Cairo">420 م</text>
        </svg>
      )}

      {/* Lens photo markers on map (small dots) */}
      {showLens && LENS_PHOTOS.map((_, i) => (
        <div key={i} className="absolute z-20 cursor-pointer"
          style={{ left: `${44 + i * 6}%`, top: `${50 + i * 3}%`, transform: "translate(-50%,-50%)" }}
          onClick={() => setLensPhoto(i)}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-lg transition-all ${lensPhoto === i ? "bg-teal-500 border-white scale-125" : "bg-teal-600/80 border-teal-300"}`}>
            <Camera className="w-3 h-3 text-white" />
          </div>
        </div>
      ))}

      {/* ── MAIN POI MARKER (clickable) ── */}
      <div
        className="absolute z-20 cursor-pointer"
        style={{ left: "48%", top: "52%", transform: "translate(-50%,-100%)" }}
        onClick={() => setShowMarkerPopup(!showMarkerPopup)}
      >
        <div className="flex flex-col items-center group">
          <div className={`w-12 h-12 rounded-full border-4 border-white shadow-2xl flex items-center justify-center ring-4 transition-all ${
            showMarkerPopup ? "bg-blue-400 ring-blue-300/60 scale-110" : "bg-blue-600 ring-blue-400/40 group-hover:scale-110 group-hover:bg-blue-500"
          }`}>
            <MapPin className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="w-0.5 h-5 bg-blue-600" />
          <div className="w-3 h-3 rounded-full bg-blue-600 opacity-60" />
        </div>
      </div>

      {/* ── POI MARKER POPUP ── */}
      {showMarkerPopup && poiRequest && (
        <div
          className="absolute z-30 bg-[#1e2533]/98 backdrop-blur border border-white/15 rounded-xl shadow-2xl overflow-hidden"
          style={{ left: "50%", top: "28%", transform: "translateX(-50%)", width: "300px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#252d3d] border-b border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{poiRequest.poiName}</p>
                <p className="text-xs text-white/40">{poiRequest.city} · {poiRequest.district}</p>
              </div>
            </div>
            <button onClick={() => setShowMarkerPopup(false)}
              className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Data fields */}
          <div className="px-4 py-3 space-y-2">
            {poiRequest.currentData?.mainCategory && (
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <span className="text-xs text-white/60">{poiRequest.currentData.mainCategory}</span>
                {poiRequest.currentData.subCategory && (
                  <span className="text-xs text-white/30">· {poiRequest.currentData.subCategory}</span>
                )}
              </div>
            )}
            {poiRequest.currentData?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <span className="text-xs text-white/60 font-mono" dir="ltr">{poiRequest.currentData.phone}</span>
              </div>
            )}
            {poiRequest.currentData?.coordinates && (
              <div className="flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <span className="text-xs text-white/50 font-mono" dir="ltr">{poiRequest.currentData.coordinates}</span>
              </div>
            )}
            {(poiRequest.currentData?.openTime || poiRequest.currentData?.workingDays) && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <span className="text-xs text-white/60">
                  {poiRequest.currentData?.workingDays} · {poiRequest.currentData?.openTime} — {poiRequest.currentData?.closeTime}
                </span>
              </div>
            )}
            {poiRequest.currentData?.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <span className="text-xs text-blue-400 truncate">{poiRequest.currentData.website}</span>
              </div>
            )}
            {/* Status badge */}
            <div className="flex items-center justify-between pt-1 border-t border-white/8">
              <span className={`text-xs px-2 py-0.5 rounded border ${
                poiRequest.currentData?.status === "open"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/15 border-red-500/30 text-red-400"
              }`}>
                {poiRequest.currentData?.status === "open" ? "مفتوح" : "مغلق"}
              </span>
              <span className="text-xs text-white/25 font-mono">{poiRequest.requestId}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 py-3 border-t border-white/8 flex gap-2 bg-[#161b27]">
            <button
              onClick={() => { onEditPOI?.(); setShowMarkerPopup(false); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5" />
              مقارنة البيانات
            </button>
            <button
              onClick={() => { onEditPOI?.(); setShowMarkerPopup(false); }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/25 text-xs transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              تعديل
            </button>
          </div>
        </div>
      )}

      {/* Extra markers */}
      {markers.map((m, i) => i > 0 && (
        <div key={i} className="absolute" style={{ zIndex: 15, left: `${38 + i * 8}%`, top: `${45 + i * 4}%`, transform: "translate(-50%,-100%)" }}>
          <div className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow ${m.type === "proposed" ? "bg-amber-500" : "bg-gray-500"}`}>
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      ))}

      {/* ── LEFT CONTROLS ── */}
      {/* Toolbar */}
      <div className="absolute top-1/2 -translate-y-1/2 left-3 z-20">
        <div className="bg-[#161b27]/95 backdrop-blur border border-white/10 rounded-lg p-1.5 flex flex-col gap-1 shadow-xl">
          {mapTools.map(tool => (
            <div key={tool.id} className="relative"
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}>
              <button onClick={() => handleToolClick(tool.id)}
                className={`w-8 h-8 rounded flex items-center justify-center transition-all ${activeTool === tool.id ? "bg-blue-600 text-white" : "text-white/50 hover:text-white hover:bg-white/10"}`}>
                <tool.icon className="w-4 h-4" />
              </button>
              {hoveredTool === tool.id && (
                <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-30" style={{ left: "calc(100% + 8px)" }}>
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-white/10">{tool.label}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Zoom + compass */}
      <div className="absolute bottom-8 left-3 z-20 flex flex-col gap-1">
        <div className="w-8 h-8 bg-[#1e2533] border border-white/10 rounded flex items-center justify-center">
          <Navigation className="w-4 h-4 text-blue-400" />
        </div>
        <div className="w-8 h-px bg-white/10" />
        <button onClick={() => setZoom(z => Math.min(z + 1, 20))}
          className="w-8 h-8 bg-[#1e2533] border border-white/10 rounded text-white/70 hover:text-white hover:bg-[#2a3347] flex items-center justify-center transition-colors">
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-8 h-6 bg-[#161b27] border border-white/10 rounded flex items-center justify-center">
          <span className="text-xs text-white/50">{zoom}</span>
        </div>
        <button onClick={() => setZoom(z => Math.max(z - 1, 5))}
          className="w-8 h-8 bg-[#1e2533] border border-white/10 rounded text-white/70 hover:text-white hover:bg-[#2a3347] flex items-center justify-center transition-colors">
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-2 left-14 text-xs text-white/20 z-10">© OpenStreetMap · بيانات تجريبية</div>

      {/* ── STREET VIEW — compact floating box ── */}
      {showStreetView && !streetFullscreen && (
        <div className="absolute bottom-20 left-14 z-30 w-96 rounded-xl overflow-hidden shadow-2xl border border-white/15 bg-[#0a0e14]">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#161b27] border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <Camera className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-xs text-blue-300 font-medium">Street View</span>
              <span className="text-xs text-white/30">شارع العروبة · {streetHeading}°</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setStreetFullscreen(true)}
                className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={onStreetViewClose ?? (() => { handleToolClick("base"); setStreetFullscreen(false); })}
                className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Photo */}
          <div className="h-52 relative overflow-hidden">
            <img src={streetScenes[streetScene]} alt="Street View"
              className="w-full h-full object-cover transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

            {/* Compass — top left */}
            <div className="absolute top-2 left-2 scale-75 origin-top-left">
              <CompassRing heading={streetHeading} />
            </div>

            {/* POI label */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <div className="bg-blue-600/90 border border-white/30 text-white text-xs px-2 py-0.5 rounded-full shadow whitespace-nowrap">
                📍 {poiRequest?.poiName || "المعلم المحدد"}
              </div>
            </div>

            {/* Prev/Next */}
            <button onClick={() => { setStreetScene(s => Math.max(0, s - 1)); setStreetHeading(h => (h - 45 + 360) % 360); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-black/70 disabled:opacity-30"
              disabled={streetScene === 0}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => { setStreetScene(s => Math.min(streetScenes.length - 1, s + 1)); setStreetHeading(h => (h + 45) % 360); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-black/70 disabled:opacity-30"
              disabled={streetScene === streetScenes.length - 1}>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Info overlay bottom */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="text-xs text-white/60 bg-black/50 px-2 py-0.5 rounded">150م من المعلم</div>
              <div className="text-xs text-white/50 bg-black/50 px-2 py-0.5 rounded">اتجاه: {streetHeading}°</div>
            </div>
          </div>

          {/* Mini map + scene strip */}
          <div className="flex items-center gap-3 px-3 py-2 bg-[#0a0e14]">
            {/* Mini map */}
            <div className="w-20 h-14 rounded-lg overflow-hidden border border-white/15 bg-[#0d1117] relative flex-shrink-0">
              <MapGrid />
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <polyline points="15%,70% 35%,55% 50%,50% 70%,45%" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" />
                <circle cx="50%" cy="50%" r="4" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
                <polygon points="50%,50% 44%,32% 56%,32%" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth="0.5" />
              </svg>
            </div>
            {/* Scene dots + play */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <button className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20">
                  <Play className="w-3 h-3" />
                </button>
                <div className="flex-1 flex gap-1">
                  {streetScenes.map((_, i) => (
                    <button key={i} onClick={() => setStreetScene(i)}
                      className={`h-1.5 rounded-full transition-all ${streetScene === i ? "bg-blue-400 flex-1" : "bg-white/20 w-5 hover:bg-white/40"}`} />
                  ))}
                </div>
                <span className="text-xs text-white/35 tabular-nums">{streetScene + 1}/{streetScenes.length}</span>
              </div>
              <div className="text-xs text-white/35">شارع العروبة، العليا، الرياض</div>
            </div>
          </div>
        </div>
      )}

      {/* ── STREET VIEW — fullscreen ── */}
      {showStreetView && streetFullscreen && (
        <div className="absolute inset-0 z-40 flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            <img src={streetScenes[streetScene]} alt="Street View"
              className="w-full h-full object-cover transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">شارع العروبة، العليا</p>
                  <p className="text-white/50 text-xs font-mono">24.7136° N, 46.6753° E</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setStreetFullscreen(false)}
                  className="w-9 h-9 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button onClick={onStreetViewClose ?? (() => { handleToolClick("base"); setStreetFullscreen(false); })}
                  className="w-9 h-9 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Compass ring */}
            <div className="absolute top-4 left-16 z-10">
              <CompassRing heading={streetHeading} />
              <p className="text-center text-xs text-white/40 mt-1">{streetHeading}°</p>
            </div>

            {/* Scene info ribbon */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/10">
              <span className="text-xs text-white/60">صورة {streetScene + 1} / {streetScenes.length}</span>
              <span className="w-px h-3 bg-white/20" />
              <span className="text-xs text-white/60">اتجاه: {streetHeading}°</span>
              <span className="w-px h-3 bg-white/20" />
              <span className="text-xs text-emerald-400">مباشر</span>
            </div>

            {/* Navigation arrows */}
            <button onClick={() => { setStreetScene(s => Math.max(0, s - 1)); setStreetHeading(h => (h - 45 + 360) % 360); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-black/50 border-2 border-white/20 flex items-center justify-center text-white group-hover:bg-black/70 group-hover:border-white/40 transition-all">
                <ChevronLeft className="w-6 h-6" />
              </div>
              <span className="text-xs text-white/50 bg-black/40 px-2 py-0.5 rounded-full">السابق</span>
            </button>
            <button onClick={() => { setStreetScene(s => Math.min(streetScenes.length - 1, s + 1)); setStreetHeading(h => (h + 45) % 360); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-black/50 border-2 border-white/20 flex items-center justify-center text-white group-hover:bg-black/70 group-hover:border-white/40 transition-all">
                <ChevronRight className="w-6 h-6" />
              </div>
              <span className="text-xs text-white/50 bg-black/40 px-2 py-0.5 rounded-full">التالي</span>
            </button>

            {/* POI marker overlay */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <div className="bg-blue-600/90 border-2 border-white text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-xl whitespace-nowrap">
                📍 {poiRequest?.poiName || "المعلم المحدد"}
              </div>
              <div className="w-0.5 h-8 bg-blue-400/60" />
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
            </div>

            {/* Bottom mini-map + controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-12 pb-4 px-6">
              <div className="flex items-end gap-4">
                <div className="w-44 h-28 rounded-xl overflow-hidden border-2 border-white/20 bg-[#0d1117] relative flex-shrink-0 shadow-2xl">
                  <MapGrid />
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <polyline points="15%,70% 30%,60% 50%,55% 70%,50%" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <circle cx="50%" cy="55%" r="5" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
                    <polygon points="50%,55% 42%,35% 58%,35%" fill="rgba(59,130,246,0.25)" stroke="#3b82f6" strokeWidth="0.5" />
                  </svg>
                  <div className="absolute bottom-1 right-1 text-xs text-white/30 font-mono text-[9px]">العليا، الرياض</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 text-white/60 text-xs">
                      <span>شارع العروبة</span>
                      <span className="text-white/30">·</span>
                      <span>150م من المعلم</span>
                    </div>
                    <button className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60 hover:bg-white/20 border border-white/15 transition-colors">
                      إعادة تمركز
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20">
                      <Play className="w-4 h-4" />
                    </button>
                    <div className="flex-1 flex gap-1.5">
                      {streetScenes.map((_, i) => (
                        <button key={i} onClick={() => setStreetScene(i)}
                          className={`h-1.5 rounded-full transition-all ${streetScene === i ? "bg-blue-400 flex-1" : "bg-white/20 w-6 hover:bg-white/40"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-white/40 tabular-nums">{streetScene + 1}/{streetScenes.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BALADY LENS — compact floating box ── */}
      {showLens && !lensFullscreen && (
        <div className="absolute bottom-20 left-14 z-30 w-80 rounded-xl overflow-hidden shadow-2xl border border-white/15 bg-[#0a0e14]">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#161b27] border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
                <Eye className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-xs text-teal-300 font-medium">عدسة بلدي 360°</span>
              <span className="text-xs text-white/30">{lensPhoto + 1}/{LENS_PHOTOS.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setLensFullscreen(true)}
                className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={onLensClose ?? (() => handleToolClick("base"))}
                className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main photo */}
          <div className="h-44 relative overflow-hidden">
            <img src={LENS_PHOTOS[lensPhoto].url} alt="عدسة بلدي" className="w-full h-full object-cover transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
            {/* Prev/Next */}
            <button onClick={() => setLensPhoto(p => Math.max(0, p - 1))} disabled={lensPhoto === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/70">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setLensPhoto(p => Math.min(LENS_PHOTOS.length - 1, p + 1))} disabled={lensPhoto === LENS_PHOTOS.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/70">
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* 360 badge */}
            <div className="absolute top-2 left-2 bg-black/60 border border-white/20 rounded px-1.5 py-0.5 flex items-center gap-1">
              <RotateCw className="w-2.5 h-2.5 text-teal-400" />
              <span className="text-xs text-white/70">360°</span>
            </div>
            {/* Info overlay */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="text-xs text-white/60 bg-black/40 px-2 py-0.5 rounded">
                {LENS_PHOTOS[lensPhoto].dist}م · {LENS_PHOTOS[lensPhoto].angle}°
              </div>
              <div className="text-xs text-white/50 bg-black/40 px-2 py-0.5 rounded">
                {LENS_PHOTOS[lensPhoto].date}
              </div>
            </div>
          </div>

          {/* Thumbnail strip + action */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0e14]">
            <div className="flex gap-1.5 flex-1">
              {LENS_PHOTOS.map((p, i) => (
                <div key={i} onClick={() => setLensPhoto(i)}
                  className={`h-9 rounded overflow-hidden cursor-pointer border transition-all ${lensPhoto === i ? "border-teal-400 flex-1" : "border-white/15 w-9 opacity-60 hover:opacity-90"}`}>
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <button className="text-xs px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors whitespace-nowrap">
              استخدام
            </button>
          </div>
        </div>
      )}

      {/* Balady Lens fullscreen */}
      {showLens && lensFullscreen && (
        <div className="absolute inset-0 z-40 bg-[#0a0e14] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-[#161b27] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
                <Eye className="w-3 h-3 text-white" />
              </div>
              <span className="text-white text-sm font-medium">عدسة بلدي — 360°</span>
              <span className="text-xs bg-teal-600/20 border border-teal-500/30 text-teal-300 px-2 py-0.5 rounded-full">{LENS_PHOTOS.length} صور</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setLensFullscreen(false)}
                className="w-7 h-7 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10">
                <Minimize2 className="w-4 h-4" />
              </button>
              <button onClick={onLensClose ?? (() => handleToolClick("base"))}
                className="w-7 h-7 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 relative overflow-hidden bg-black">
              <img src={LENS_PHOTOS[lensPhoto].url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
              <div className="absolute top-4 left-4 bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white/80 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-teal-400" />
                <span>عرض بانوراما 360°</span>
              </div>
              <button onClick={() => setLensPhoto(p => Math.max(0, p - 1))} disabled={lensPhoto === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/70">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setLensPhoto(p => Math.min(LENS_PHOTOS.length - 1, p + 1))} disabled={lensPhoto === LENS_PHOTOS.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/70">
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-[#161b27]/95 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span>📅 {LENS_PHOTOS[lensPhoto].date}</span>
                    <span>🧭 {LENS_PHOTOS[lensPhoto].angle}°</span>
                    <span>📍 {LENS_PHOTOS[lensPhoto].dist}م</span>
                  </div>
                  <button className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg transition-colors">
                    استخدام كمرجع
                  </button>
                </div>
                <div className="flex gap-2">
                  {LENS_PHOTOS.map((p, i) => (
                    <div key={i} onClick={() => setLensPhoto(i)}
                      className={`w-14 h-10 rounded overflow-hidden cursor-pointer border-2 transition-all ${lensPhoto === i ? "border-teal-400" : "border-white/20 opacity-60 hover:opacity-100"}`}>
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-48 bg-[#161b27] border-r border-white/10 flex flex-col overflow-hidden shrink-0">
              <div className="px-3 py-2 border-b border-white/8">
                <p className="text-xs text-white/50 font-medium">صور قريبة</p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {LENS_PHOTOS.map((p, i) => (
                  <div key={i} onClick={() => setLensPhoto(i)}
                    className={`rounded-lg overflow-hidden cursor-pointer border transition-all ${lensPhoto === i ? "border-teal-500/60" : "border-white/10 hover:border-white/20"}`}>
                    <div className="h-16 relative">
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="px-2 py-1.5 bg-[#1e2533]">
                      <p className="text-xs text-white/70">صورة #{i + 1}</p>
                      <p className="text-xs text-white/40">{p.dist}م · {p.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
