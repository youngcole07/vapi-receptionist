import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Phone, 
  BarChart3, 
  Users, 
  Settings, 
  Mic,
  LogOut 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Agent Setup", href: "/setup", icon: Settings },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-slate-200">
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className="flex items-center px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg mr-3">
            <Phone className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900">AI Receptionist</h1>
            <p className="text-xs text-slate-500">
              {user?.businessName || "Your Business"}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-medium text-white">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.email || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">Free Trial</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
