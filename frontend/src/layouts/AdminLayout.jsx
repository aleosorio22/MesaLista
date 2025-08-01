import { Outlet } from "react-router-dom";
import Sidebar, { useSidebar } from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

export default function AdminLayout() {
  const { isExpanded, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "md:ml-64" : "md:ml-[80px]"
        }`}
      >
        <Navbar />
        
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay para mobile cuando el sidebar está abierto */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" />
      )}
    </div>
  );
}
