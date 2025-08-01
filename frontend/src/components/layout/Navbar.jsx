import { useState } from "react";
import { Search, Bell, Settings, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useSidebar } from "./Sidebar";

export default function Navbar() {
  const { auth, logout } = useAuth();
  const { setIsMobileOpen } = useSidebar();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMobileSidebar = () => {
    setIsMobileOpen(true);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileSidebar}
              className="md:hidden p-2 rounded-md text-text-muted hover:text-text-secondary hover:bg-neutral-100 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb o título */}
            <div className="ml-4 md:ml-0">
              <h1 className="text-xl font-semibold text-text-primary">
                Panel Administrativo
              </h1>
            </div>
          </div>

          {/* Center - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-text-muted" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 py-2"
                placeholder="Buscar..."
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search button for mobile */}
            <button className="md:hidden p-2 rounded-md text-text-muted hover:text-text-secondary hover:bg-neutral-100 transition-colors">
              <Search size={20} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-md text-text-muted hover:text-text-secondary hover:bg-neutral-100 transition-colors relative">
                <Bell size={20} />
                {/* Badge de notificación */}
                <span className="badge-notification absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>

            {/* Settings */}
            <button className="hidden sm:block p-2 rounded-md text-text-muted hover:text-text-secondary hover:bg-neutral-100 transition-colors">
              <Settings size={20} />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {auth?.user?.nombre?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-text-primary">
                    {auth?.user?.nombre || 'admin'}
                  </div>
                  <div className="text-xs text-text-secondary capitalize">
                    {auth?.user?.rol || 'Admin'}
                  </div>
                </div>
                <ChevronDown className="hidden sm:block w-4 h-4 text-text-muted" />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <>
                  {/* Overlay para cerrar el menú */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20">
                    <div className="px-4 py-2 border-b border-neutral-200">
                      <div className="text-sm font-medium text-text-primary">
                        {auth?.user?.nombre || 'admin'}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {auth?.user?.correo || 'admin@elangel.com'}
                      </div>
                    </div>
                    
                    <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-neutral-50 transition-colors">
                      Mi Perfil
                    </button>
                    
                    <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-neutral-50 transition-colors">
                      Configuración
                    </button>
                    
                    <div className="border-t border-neutral-200 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
