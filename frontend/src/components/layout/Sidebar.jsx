import { useState, useEffect, createContext, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Home,
  Users,
  Package,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Calendar
} from "lucide-react";

// Contexto para el Sidebar
const SidebarContext = createContext();
export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsExpanded(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        setIsExpanded,
        isMobileOpen,
        setIsMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();
  const { isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen } = useSidebar();

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/admin/dashboard" },
    { name: "Usuarios", icon: Users, path: "/admin/usuarios" },
    { name: "Clientes", icon: Users, path: "/admin/clientes" },
    { name: "Productos", icon: Package, path: "/admin/productos" },
    { name: "Reservaciones", icon: Calendar, path: "/admin/reservaciones" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const handleMenuItemClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
    if (window.innerWidth >= 768 && isExpanded) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-text-secondary transition-all duration-300 ease-in-out
                   ${isExpanded ? "w-64" : "w-[80px]"} 
                   hidden md:flex shadow-sm border-r border-neutral-200`}
      >
        {/* Logo y toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
          <Link to="/admin/dashboard" className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">EA</span>
            </div>
            {isExpanded && (
              <span className="ml-3 text-text-primary font-semibold">El Ángel</span>
            )}
          </Link>

          {isExpanded && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-text-muted hover:text-text-secondary hover:bg-neutral-100 transition-colors"
              aria-label="Colapsar menú"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {/* Toggle button para sidebar colapsado */}
        {!isExpanded && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-primary-500 p-1.5 rounded-full text-white hover:bg-primary-600 shadow-md transition-colors"
            aria-label="Expandir menú"
          >
            <Menu size={16} />
          </button>
        )}

        {/* Navegación principal */}
        <div className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1.5 px-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={handleMenuItemClick}
                  className={`flex items-center ${
                    isExpanded ? "px-4" : "justify-center px-0"
                  } py-3 rounded-lg transition-all duration-200
                            ${
                              isActive(item.path)
                                ? "sidebar-item-active"
                                : "sidebar-item"
                            }`}
                >
                  <item.icon
                    className={`${isExpanded ? "mr-3" : ""} transition-transform ${
                      isActive(item.path) ? "scale-110" : ""
                    }`}
                    size={20}
                  />
                  {isExpanded && <span className="font-medium">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Botón de cerrar sesión */}
        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={logout}
            className={`flex items-center ${
              isExpanded ? "px-4" : "justify-center px-0"
            } py-3 w-full text-text-secondary hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors`}
            title="Cerrar Sesión"
          >
            <LogOut className={`${isExpanded ? "mr-3" : ""}`} size={20} />
            {isExpanded && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-50 transition-transform duration-300 ease-in-out transform ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closeMobileSidebar}
          ></div>

          {/* Contenido del sidebar */}
          <div className="absolute inset-y-0 left-0 w-[280px] bg-sidebar flex flex-col shadow-xl">
            {/* Header con botón de cerrar */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
              <Link
                to="/admin/dashboard"
                className="flex items-center"
                onClick={closeMobileSidebar}
              >
                <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">EA</span>
                </div>
                <span className="ml-3 text-text-primary font-semibold">El Ángel</span>
              </Link>
              <button
                onClick={closeMobileSidebar}
                className="p-2 rounded-md text-text-muted hover:text-text-secondary hover:bg-neutral-100 transition-colors"
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navegación */}
            <div className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-3">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? "sidebar-item-active"
                          : "sidebar-item"
                      }`}
                      onClick={closeMobileSidebar}
                    >
                      <item.icon
                        className={`mr-3 ${isActive(item.path) ? "scale-110" : ""}`}
                        size={20}
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200">
              <button
                onClick={() => {
                  logout();
                  closeMobileSidebar();
                }}
                className="flex items-center w-full px-4 py-3 text-text-secondary hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <LogOut className="mr-3" size={20} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
