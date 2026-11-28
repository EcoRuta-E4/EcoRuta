import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext.jsx';
import ProtectedRoute from '../auth/ProtectedRoute.jsx';
import Layout from '../components/Layout.jsx';
import { SECCIONES } from '../components/nav.js';
import HomePage from '../pages/publico/HomePage';
import LoginPage from '../pages/publico/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import VehiculosPage from '../pages/admin/vehiculos/VehiculosPage';
import RegistrarVehiculoPage from '../pages/admin/vehiculos/RegistrarVehiculoPage';
import DetalleVehiculoPage from '../pages/admin/vehiculos/DetalleVehiculoPage';
import SeccionPage from '../pages/admin/SeccionPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Bloqueo de rutas (RF-04): sin token redirige a /login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/vehiculos" element={<VehiculosPage />} />
              <Route path="/vehiculos/nuevo" element={<RegistrarVehiculoPage />} />
              <Route path="/vehiculos/:id" element={<DetalleVehiculoPage />} />
              <Route path="/vehiculos/:id/editar" element={<RegistrarVehiculoPage />} />
              {SECCIONES.filter((s) => s.to !== '/dashboard' && s.to !== '/vehiculos').map((s) => (
                <Route key={s.to} path={s.to} element={<SeccionPage />} />
              ))}
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
