import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/layout/ProtectedRoute';

import Login              from './pages/Login';
import GestionDocentes    from './pages/admin/GestionDocentes';
import DocenteDashboard   from './pages/docente/Dashboard';
import GestionAlumnos     from './pages/docente/GestionAlumnos';
import GestionDesafios    from './pages/docente/GestionDesafios';
import MisDesafios        from './pages/estudiante/MisDesafios';
import Desafio            from './pages/estudiante/Desafio';
import Ranking            from './pages/estudiante/Ranking';

function RootRedirect() {
  const stored = localStorage.getItem('usuario');
  if (!stored) return <Navigate to="/login" replace />;
  try {
    const u = JSON.parse(stored);
    const map = { admin: '/admin', docente: '/docente', estudiante: '/estudiante' };
    return <Navigate to={map[u.rol] || '/login'} replace />;
  } catch { return <Navigate to="/login" replace />; }
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"      element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <GestionDocentes />
            </ProtectedRoute>
          } />
          <Route path="/admin/docentes" element={
            <ProtectedRoute roles={['admin']}>
              <GestionDocentes />
            </ProtectedRoute>
          } />

          {/* Docente */}
          <Route path="/docente" element={
            <ProtectedRoute roles={['docente', 'admin']}>
              <DocenteDashboard />
            </ProtectedRoute>
          } />
          <Route path="/docente/alumnos" element={
            <ProtectedRoute roles={['docente', 'admin']}>
              <GestionAlumnos />
            </ProtectedRoute>
          } />
          <Route path="/docente/desafios" element={
            <ProtectedRoute roles={['docente', 'admin']}>
              <GestionDesafios />
            </ProtectedRoute>
          } />

          {/* Estudiante */}
          <Route path="/estudiante" element={
            <ProtectedRoute roles={['estudiante']}>
              <MisDesafios />
            </ProtectedRoute>
          } />
          <Route path="/estudiante/desafio/:uid" element={
            <ProtectedRoute roles={['estudiante']}>
              <Desafio />
            </ProtectedRoute>
          } />
          <Route path="/estudiante/ranking" element={
            <ProtectedRoute roles={['estudiante']}>
              <Ranking />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}