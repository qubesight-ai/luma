import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Menu, Settings, LogOut, Shield, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/hooks/useDemoMode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isDemoUser } = useDemoMode();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!data);
    };

    checkAdminRole();
  }, [user]);

  // Navigation items
  const navItems = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Articles', path: '/articles' },
    { label: 'Grammar', path: '/grammar' },
    { label: 'Vocabulary', path: '/vocabulary' },
    { label: 'Practice', path: '/practice' },
    { label: 'Listening Lab', path: '/listening-lab' },
    { label: 'Tests', path: '/tests' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/70 bg-white/70 backdrop-blur-2xl shadow-[0_4px_24px_rgba(38,198,218,0.1)]">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {children}
          <button className="lg:hidden p-2 hover:bg-white/70 rounded-full transition-colors">
            <Menu className="w-5 h-5 text-[#0b3b4a]" />
          </button>
          <button 
            className="flex items-center gap-2.5 group text-left"
            onClick={() => navigate("/dashboard")}
            title="Luma - Learn brighter."
          >
            <div className="w-10 h-10 rounded-2xl orb-aqua flex items-center justify-center shadow-aqua-sm group-hover:scale-105 transition-all relative overflow-hidden flex-shrink-0">
              <span className="text-white font-display font-black text-xl drop-shadow-md">L</span>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white blur-[0.3px] opacity-90 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl leading-none text-[#0b3b4a] tracking-tight group-hover:text-primary transition-colors">
                  Luma
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-ping hidden sm:inline-block"></span>
              </div>
              <span className="text-[10px] font-bold text-primary tracking-wide hidden sm:block mt-0.5 opacity-90">
                Learn brighter.
              </span>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/50 border border-white/80 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(38,198,218,0.08)]">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${
                location.pathname === item.path 
                  ? 'btn-gel-aqua text-white shadow-aqua-sm' 
                  : 'text-[#0b3b4a] hover:bg-white/80 hover:text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative rounded-full bg-white/60 hover:bg-white/90 border border-white/80 shadow-[0_2px_8px_rgba(38,198,218,0.08)]">
            <Bell className="w-4 h-4 text-[#0b3b4a]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#69f0ae] rounded-full shadow-[0_0_8px_#69f0ae] animate-pulse" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="rounded-full bg-white/60 hover:bg-white/90 border border-white/80 shadow-[0_2px_8px_rgba(38,198,218,0.08)]">
            <Settings className="w-4 h-4 text-[#0b3b4a]" />
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-[#26c6da] to-[#00acc1] border-2 border-white/90 shadow-aqua-sm flex items-center justify-center ml-2 cursor-pointer hover:scale-105 transition-all">
                  <span className="text-white font-display font-bold text-sm drop-shadow-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 aero-glass border-white/90">
                <div className="px-3 py-2">
                  <p className="text-sm font-display font-semibold text-[#0b3b4a]">{isDemoUser ? 'Demo User' : user.email}</p>
                  {isDemoUser && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Eye className="w-3 h-3 text-[#3c494b]" />
                      <span className="text-xs text-[#3c494b]">Read-only mode</span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-white/60" />
                {isAdmin && !isDemoUser && (
                  <DropdownMenuItem onClick={() => navigate('/admin/users')} className="rounded-xl cursor-pointer">
                    <Shield className="w-4 h-4 mr-2 text-primary" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                {isAdmin && !isDemoUser && (
                  <DropdownMenuItem onClick={() => navigate('/admin/progress')} className="rounded-xl cursor-pointer">
                    <Shield className="w-4 h-4 mr-2 text-primary" />
                    Teacher Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/my-progress')} className="rounded-xl cursor-pointer">
                  My Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/conversation/history')} className="rounded-xl cursor-pointer">
                  Conversation History
                </DropdownMenuItem>
                {!isDemoUser && (
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-xl cursor-pointer">
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/60" />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive rounded-xl cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/auth')}
              className="ml-2 btn-gel-aqua shadow-aqua-sm"
            >
              Get Started
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
