import { Dispatch, SetStateAction } from "react";
import { 
  LayoutDashboard, 
  // LogOut, // Remove if not used
  // Smartphone, // Remove if not used
  Zap,
  // Database, // Remove if not used
  Menu
} from "lucide-react";

type SidebarProps = {
  active: 'quiz';
  setActive: Dispatch<SetStateAction<'quiz'>>;
  mobileOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ active, setActive, mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-30
        w-64 h-screen
        bg-gradient-to-b from-gray-900 to-gray-800
        text-white
        flex flex-col
        border-r border-gray-700/50
        shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4 border-b border-gray-700/50">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <Menu className="w-5 h-5 rotate-90" />
          </button>
        </div>

        {/* Logo & Brand */}
        <div className="p-6 pb-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Quiz Manager
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Interactive Learning Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button
              onClick={() => {
                setActive("quiz");
                onClose?.();
              }}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl
                font-medium text-left transition-all duration-200
                ${active === "quiz" 
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-l-4 border-blue-500 shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }
              `}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                ${active === "quiz" 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gray-700'
                }
              `}>
                <LayoutDashboard className={`w-4 h-4 ${active === "quiz" ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <span>Dashboard</span>
              {active === "quiz" && (
                <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </button>

            {/* Stats Section */}
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Quick Stats
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/30">
                  <span className="text-sm text-gray-400">Active Quizzes</span>
                  <span className="text-green-400 font-bold">3</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/30">
                  <span className="text-sm text-gray-400">Total Participants</span>
                  <span className="text-blue-400 font-bold">127</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Quiz Manager
            </p>
            <p className="text-[10px] text-gray-600 mt-1">
              v1.0.0 • All rights reserved
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}