import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";
import {
  MapPin, Users, Building2, ClipboardList, CheckCircle,
  TrendingUp, TrendingDown, Clock, AlertTriangle,
  Award, Activity, Globe, BarChart2, Filter, Download,
  ChevronDown, Calendar
} from "lucide-react";
import { useState } from "react";

// ── Mock data ────────────────────────────────────────────────────────────

const monthlyAdditions = [
  { month: "يناير", موظف: 142, مساح: 89, مستخدم: 34, بلدي_أعمال: 201 },
  { month: "فبراير", موظف: 158, مساح: 102, مستخدم: 41, بلدي_أعمال: 187 },
  { month: "مارس",  موظف: 175, مساح: 118, مستخدم: 52, بلدي_أعمال: 234 },
  { month: "أبريل", موظف: 160, مساح: 95,  مستخدم: 48, بلدي_أعمال: 219 },
  { month: "مايو",  موظف: 192, مساح: 134, مستخدم: 63, بلدي_أعمال: 256 },
  { month: "يونيو", موظف: 210, مساح: 147, مستخدم: 71, بلدي_أعمال: 278 },
];

const reviewStats = [
  { month: "يناير", مراجعة: 390, اعتماد: 342, رفض: 28, إعادة: 20 },
  { month: "فبراير", مراجعة: 418, اعتماد: 371, رفض: 31, إعادة: 16 },
  { month: "مارس",  مراجعة: 467, اعتماد: 421, رفض: 29, إعادة: 17 },
  { month: "أبريل", مراجعة: 442, اعتماد: 389, رفض: 35, إعادة: 18 },
  { month: "مايو",  مراجعة: 513, اعتماد: 460, رفض: 33, إعادة: 20 },
  { month: "يونيو", مراجعة: 548, اعتماد: 492, رفض: 38, إعادة: 18 },
];

const poiStatusData = [
  { name: "مفتوح ونشط",  value: 68420, color: "#10b981" },
  { name: "مفتوح — بيانات ناقصة", value: 12340, color: "#f59e0b" },
  { name: "مغلق مؤقتاً", value: 4210, color: "#6366f1" },
  { name: "مغلق نهائياً", value: 2890, color: "#ef4444" },
  { name: "قيد المراجعة", value: 1840, color: "#3b82f6" },
];

const sourceBreakdown = [
  { name: "بلدي أعمال", value: 38, color: "#8b5cf6" },
  { name: "موظفون",     value: 27, color: "#3b82f6" },
  { name: "مساحون",     value: 21, color: "#06b6d4" },
  { name: "مستخدمو بلدي+", value: 14, color: "#10b981" },
];

const cityStats = [
  { city: "الرياض",         total: 28420, active: 24100, pending: 1240, closed: 3080, growth: 12.4 },
  { city: "جدة",            total: 18750, active: 16200, pending: 890,  closed: 1660, growth: 9.8  },
  { city: "مكة المكرمة",   total: 12340, active: 10800, pending: 620,  closed: 920,  growth: 7.2  },
  { city: "المدينة المنورة", total: 8920, active: 7640,  pending: 480,  closed: 800,  growth: 11.1 },
  { city: "الدمام",         total: 9870, active: 8450,  pending: 520,  closed: 900,  growth: 14.3 },
  { city: "أبها",           total: 4210, active: 3680,  pending: 210,  closed: 320,  growth: 6.5  },
  { city: "الطائف",         total: 3840, active: 3290,  pending: 190,  closed: 360,  growth: 8.9  },
  { city: "تبوك",           total: 3120, active: 2680,  pending: 160,  closed: 280,  growth: 10.2 },
];

const employeePerformance = [
  { name: "أحمد العمري",   reviewed: 312, approved: 287, avgTime: "2.1س", accuracy: 97 },
  { name: "فهد العتيبي",   reviewed: 289, approved: 261, avgTime: "2.8س", accuracy: 95 },
  { name: "محمد السلمي",   reviewed: 276, approved: 254, avgTime: "2.4س", accuracy: 96 },
  { name: "سارة الزهراني", reviewed: 341, approved: 318, avgTime: "1.9س", accuracy: 98 },
  { name: "خالد الغامدي",  reviewed: 198, approved: 178, avgTime: "3.2س", accuracy: 93 },
];

const weeklyTrend = [
  { day: "الأحد", معالم: 45 }, { day: "الاثنين", معالم: 67 }, { day: "الثلاثاء", معالم: 58 },
  { day: "الأربعاء", معالم: 82 }, { day: "الخميس", معالم: 74 }, { day: "الجمعة", معالم: 23 }, { day: "السبت", معالم: 38 },
];

// ── Sub-components ───────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, trend, color = "blue",
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
  trend?: { value: number; label: string }; color?: string;
}) {
  const colors: Record<string, string> = {
    blue:   "from-blue-600/20 to-blue-600/5 border-blue-500/20",
    emerald:"from-emerald-600/20 to-emerald-600/5 border-emerald-500/20",
    violet: "from-violet-600/20 to-violet-600/5 border-violet-500/20",
    amber:  "from-amber-600/20 to-amber-600/5 border-amber-500/20",
    cyan:   "from-cyan-600/20 to-cyan-600/5 border-cyan-500/20",
    red:    "from-red-600/20 to-red-600/5 border-red-500/20",
  };
  const iconColors: Record<string, string> = {
    blue: "text-blue-400", emerald: "text-emerald-400", violet: "text-violet-400",
    amber: "text-amber-400", cyan: "text-cyan-400", red: "text-red-400",
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${colors[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend.value >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">
        {typeof value === "number" ? value.toLocaleString("ar-SA") : value}
      </div>
      <div className="text-xs text-white/50">{label}</div>
      {sub && <div className="text-xs text-white/30 mt-0.5">{sub}</div>}
      {trend && <div className="text-xs text-white/30 mt-1">{trend.label}</div>}
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
    </div>
  );
}

const TOOLTIP_STYLE = {
  backgroundColor: "#1e2533",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#e6edf3",
  fontSize: "12px",
};

// ── Main component ───────────────────────────────────────────────────────

export function ReportsScreen() {
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("month");
  const [citySort, setCitySort] = useState<"total" | "growth">("total");

  const sortedCities = [...cityStats].sort((a, b) =>
    citySort === "total" ? b.total - a.total : b.growth - a.growth
  );

  return (
    <div className="h-full overflow-y-auto bg-[#0d1117]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="max-w-[1400px] mx-auto px-6 py-6">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">التقارير والإحصائيات</h1>
            <p className="text-sm text-white/40 mt-0.5">آخر تحديث: {new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="flex bg-[#1e2533] border border-white/10 rounded-lg overflow-hidden">
              {(["week", "month", "quarter", "year"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs transition-colors ${period === p ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"}`}>
                  {{ week: "أسبوع", month: "شهر", quarter: "ربع سنة", year: "سنة" }[p]}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1e2533] border border-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
              <Download className="w-3.5 h-3.5" />
              تصدير PDF
            </button>
          </div>
        </div>

        {/* ── SECTION 1: Key metrics ─────────────────────────────────── */}
        <div className="grid grid-cols-6 gap-3 mb-8">
          <StatCard icon={MapPin}      label="إجمالي المعالم"     value={89700}  sub="على خريطة بلدي+"            trend={{ value: 8.4,  label: "مقارنة بالشهر الماضي" }} color="blue"    />
          <StatCard icon={CheckCircle}  label="معتمدة هذا الشهر"  value={492}    sub="من أصل 548 طلب"             trend={{ value: 12.1, label: "مقارنة بالشهر الماضي" }} color="emerald" />
          <StatCard icon={Clock}        label="متوسط وقت المراجعة" value="2.4 س"  sub="هدف: أقل من 4 ساعات"                                                               color="cyan"    />
          <StatCard icon={Activity}     label="معدل الاعتماد"      value="89.8%"  sub="من إجمالي الطلبات المراجعة" trend={{ value: 2.3,  label: "تحسن عن الشهر الماضي"  }} color="emerald" />
          <StatCard icon={AlertTriangle} label="بيانات ناقصة"      value={12340}  sub="تحتاج إكمال"               trend={{ value: -3.1, label: "انخفاض عن الشهر الماضي"  }} color="amber"   />
          <StatCard icon={Users}        label="مساحون نشطون"       value={24}     sub="زيارة هذا الشهر"           trend={{ value: 4.2,  label: "مقارنة بالشهر الماضي" }} color="violet"  />
        </div>

        {/* ── SECTION 2: POI Additions ──────────────────────────────── */}
        <div className="mb-8">
          <SectionTitle title="إحصائيات إضافة المعالم" sub="مصادر البيانات المضافة لخريطة بلدي+ شهرياً" />
          <div className="grid grid-cols-3 gap-4">
            {/* Stacked bar chart */}
            <div className="col-span-2 bg-[#161b27] border border-white/8 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/70">المعالم المضافة حسب المصدر</span>
                <div className="flex gap-3 text-xs text-white/40">
                  {[
                    { color: "#8b5cf6", label: "بلدي أعمال" },
                    { color: "#3b82f6", label: "موظف" },
                    { color: "#06b6d4", label: "مساح" },
                    { color: "#10b981", label: "مستخدم" },
                  ].map(l => (
                    <span key={l.label} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyAdditions} barSize={18} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="بلدي_أعمال" fill="#8b5cf6" radius={[2,2,0,0]} />
                  <Bar dataKey="موظف"       fill="#3b82f6" radius={[2,2,0,0]} />
                  <Bar dataKey="مساح"       fill="#06b6d4" radius={[2,2,0,0]} />
                  <Bar dataKey="مستخدم"     fill="#10b981" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut + breakdown */}
            <div className="bg-[#161b27] border border-white/8 rounded-xl p-4">
              <p className="text-sm text-white/70 mb-1">توزيع المصادر (إجمالي)</p>
              <p className="text-xs text-white/35 mb-3">كنسبة من الإجمالي</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={sourceBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                    dataKey="value" stroke="none">
                    {sourceBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {sourceBreakdown.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-xs text-white/60">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.color }} />
                      </div>
                      <span className="text-xs text-white/50 w-8 text-left tabular-nums">{s.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: Review & Approval stats ────────────────────── */}
        <div className="mb-8">
          <SectionTitle title="إحصائيات المراجعة والاعتماد" sub="أداء فريق المراجعة على مدار الأشهر الستة الماضية" />
          <div className="grid grid-cols-3 gap-4">
            {/* Line chart */}
            <div className="col-span-2 bg-[#161b27] border border-white/8 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/70">مسار الطلبات الشهري</span>
                <div className="flex gap-3 text-xs text-white/40">
                  {[
                    { color: "#3b82f6", label: "مراجعة" },
                    { color: "#10b981", label: "اعتماد" },
                    { color: "#ef4444", label: "رفض" },
                    { color: "#f59e0b", label: "إعادة" },
                  ].map(l => (
                    <span key={l.label} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={reviewStats}>
                  <defs>
                    <linearGradient id="rv-grad-blue"  x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rv-grad-green" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rv-grad-red"   x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rv-grad-amber" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="مراجعة" stroke="#3b82f6" fill="url(#rv-grad-blue)"  strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="اعتماد" stroke="#10b981" fill="url(#rv-grad-green)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="رفض"    stroke="#ef4444" fill="url(#rv-grad-red)"   strokeWidth={1.5} dot={false} />
                  <Area type="monotone" dataKey="إعادة"  stroke="#f59e0b" fill="url(#rv-grad-amber)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Employee performance table */}
            <div className="bg-[#161b27] border border-white/8 rounded-xl p-4">
              <p className="text-sm text-white/70 mb-3">أداء الموظفين</p>
              <div className="space-y-2">
                {employeePerformance.map((e, i) => (
                  <div key={e.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/4 transition-colors">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? "bg-amber-500 text-black" : i === 1 ? "bg-gray-400 text-black" : i === 2 ? "bg-orange-700 text-white" : "bg-white/10 text-white/50"
                    }`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 truncate">{e.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${e.accuracy}%` }} />
                        </div>
                        <span className="text-xs text-white/40 tabular-nums">{e.accuracy}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-white/60 tabular-nums">{e.reviewed}</p>
                      <p className="text-xs text-white/30">{e.avgTime}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/8 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-bold text-white">1,416</p>
                  <p className="text-xs text-white/35">إجمالي المراجعة</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-400">1,298</p>
                  <p className="text-xs text-white/35">معتمد</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white/60">2.3س</p>
                  <p className="text-xs text-white/35">متوسط الوقت</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: POI status distribution ────────────────────── */}
        <div className="mb-8">
          <SectionTitle title="حالة المعالم الحالية" sub="توزيع 89,700 معلم على خريطة بلدي+" />
          <div className="grid grid-cols-4 gap-3">
            {/* Radial chart */}
            <div className="bg-[#161b27] border border-white/8 rounded-xl p-4 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="90%"
                  data={poiStatusData.map(d => ({ ...d, fill: d.color }))} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={4} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString("ar-SA"), ""]} />
                </RadialBarChart>
              </ResponsiveContainer>
              <p className="text-xs text-white/40 text-center mt-1">إجمالي المعالم</p>
              <p className="text-xl font-bold text-white">89,700</p>
            </div>

            {/* Status cards */}
            {poiStatusData.map(s => {
              const pct = ((s.value / 89700) * 100).toFixed(1);
              return (
                <div key={s.name} className="bg-[#161b27] border border-white/8 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-white/60">{s.name}</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-0.5">{s.value.toLocaleString("ar-SA")}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                    <span className="text-xs text-white/40 tabular-nums">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 5: Weekly trend ────────────────────────────────── */}
        <div className="mb-8">
          <SectionTitle title="معدل الإضافة الأسبوعي" sub="عدد المعالم المضافة حسب يوم الأسبوع (المتوسط)" />
          <div className="bg-[#161b27] border border-white/8 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weeklyTrend} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="معالم" radius={[4,4,0,0]}>
                  {weeklyTrend.map((_, i) => (
                    <Cell key={i} fill={i === 3 ? "#3b82f6" : "rgba(59,130,246,0.35)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── SECTION 6: City stats table ───────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">إحصائيات المدن</h2>
              <p className="text-xs text-white/40 mt-0.5">توزيع المعالم على المدن الرئيسية</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">ترتيب حسب:</span>
              <button onClick={() => setCitySort("total")}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${citySort === "total" ? "border-blue-500/40 text-blue-300 bg-blue-500/10" : "border-white/10 text-white/40 hover:text-white"}`}>
                الإجمالي
              </button>
              <button onClick={() => setCitySort("growth")}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${citySort === "growth" ? "border-blue-500/40 text-blue-300 bg-blue-500/10" : "border-white/10 text-white/40 hover:text-white"}`}>
                النمو
              </button>
            </div>
          </div>

          <div className="bg-[#161b27] border border-white/8 rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_100px_100px_100px_90px] gap-0 border-b border-white/8 px-4 py-3">
              {["المدينة", "الإجمالي", "نشط", "قيد الانتظار", "مغلق", "نمو شهري"].map((h, i) => (
                <div key={h} className={`text-xs text-white/40 font-medium ${i > 0 ? "text-center" : ""}`}>{h}</div>
              ))}
            </div>
            {sortedCities.map((city, i) => {
              const activePct = (city.active / city.total) * 100;
              return (
                <div key={city.city}
                  className="grid grid-cols-[1fr_100px_100px_100px_100px_90px] gap-0 border-b border-white/5 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30 w-4">{i + 1}</span>
                    <span className="text-sm text-white/80">{city.city}</span>
                  </div>
                  <div className="text-sm text-white/70 text-center tabular-nums">{city.total.toLocaleString("ar-SA")}</div>
                  <div className="text-center">
                    <span className="text-sm text-emerald-400 tabular-nums">{city.active.toLocaleString("ar-SA")}</span>
                    <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-1 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activePct}%` }} />
                    </div>
                  </div>
                  <div className="text-sm text-amber-400 text-center tabular-nums">{city.pending.toLocaleString("ar-SA")}</div>
                  <div className="text-sm text-red-400/70 text-center tabular-nums">{city.closed.toLocaleString("ar-SA")}</div>
                  <div className="text-center">
                    <span className={`text-sm tabular-nums ${city.growth >= 10 ? "text-emerald-400" : city.growth >= 7 ? "text-blue-400" : "text-white/50"}`}>
                      +{city.growth}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
