import { Button } from "@/components/ui/button";
import { Home, BookOpen, MessageSquare, FileText, Trophy, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "notes", label: "Notes", icon: BookOpen },
  { id: "qa", label: "Q&A", icon: FileText },
  { id: "forum", label: "Forum", icon: MessageSquare },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "report", label: "Report Issue", icon: FileText },
];

export const Sidebar = ({ currentPage, onNavigate }: SidebarProps) => {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
      setIsOpen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    signOut();
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/80 backdrop-blur-sm hover:bg-white shadow-md rounded-full h-10 w-10"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </Button>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-screen bg-white shadow-lg border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-50",
          "w-64",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800">FirstBenchers</h2>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={toggleSidebar}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Class 10</p>
        </div>
        
        <nav className="p-4 space-y-2 flex-grow">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-12",
                  currentPage === item.id && "bg-blue-600 text-white hover:bg-blue-700"
                )}
                onClick={() => {
                  onNavigate(item.id);
                  if (isMobile) {
                    setIsOpen(false);
                  }
                }}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content margin for desktop */}
      <div className="lg:ml-64" />
    </>
  );
};