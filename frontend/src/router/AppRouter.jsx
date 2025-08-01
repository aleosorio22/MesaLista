import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { SidebarProvider } from "../components/layout/Sidebar";

// Layouts
import AdminLayout from "../layouts/AdminLayout";

// Pages
import Login from "../pages/Login";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UsersManagement from "../pages/admin/UsersManagement";
import ClientsManagement from "../pages/admin/ClientsManagement";
import ProductsManagement from "../pages/admin/ProductsManagement";
import ReservationsManagement from "../pages/admin/ReservationsManagement";
import NotFound from "../pages/NotFound";

function AppRouter() {
  const { auth, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!auth ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <Route path="/" element={
            <SidebarProvider>
              <AdminLayout />
            </SidebarProvider>
          }>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/usuarios" element={<UsersManagement />} />
            <Route path="/admin/clientes" element={<ClientsManagement />} />
            <Route path="/admin/productos" element={<ProductsManagement />} />
            <Route path="/admin/reservaciones" element={<ReservationsManagement />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
