import { MapPin, LayoutDashboard, FileText, Users, Settings, Bell, HelpCircle, ChevronLeft } from "lucide-react";

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { id: 'poi', icon: MapPin, label: 'إدارة نقاط الاهتمام', active: true },
  { id: 'reports', icon: FileText, label: 'التقارير' },
  { id: 'users', icon: Users, label: 'المستخدمون' },
  { id: 'settings', icon: Settings, label: 'الإعدادات' },
];

export function Sidebar({ activeItem = 'poi', onNavigate }: SidebarProps) {
  return (
    <div className="w-14 h-full bg-[#111827] border-l border-white/6 flex flex-col items-center py-3 gap-1 z-30 shrink-0">
      {/* Logo */}
      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center mb-3 shadow-lg">
        <MapPin className="w-5 h-5 text-white" />
      </div>

      <div className="w-8 h-px bg-white/10 mb-2" />

      {/* Nav items */}
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate?.(item.id)}
          title={item.label}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all group relative ${
            activeItem === item.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-white/40 hover:text-white hover:bg-white/8'
          }`}
        >
          <item.icon className="w-5 h-5" />
          {/* Tooltip */}
          <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ right: 'calc(100% + 8px)' }}>
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-white/10">
              {item.label}
            </div>
          </div>
        </button>
      ))}

      <div className="flex-1" />

      <button className="w-10 h-10 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all relative group">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#111827]" />
      </button>
      <button className="w-10 h-10 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all">
        <HelpCircle className="w-5 h-5" />
      </button>

      <div className="w-8 h-px bg-white/10 my-1" />

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
        أح
      </div>
    </div>
  );
}
