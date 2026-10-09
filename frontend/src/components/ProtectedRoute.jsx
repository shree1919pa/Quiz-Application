import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, role: userRole, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <main className="page-shell">
        <section className="card-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>Loading session...</h2>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    if (role === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === 'examiner') {
      return <Navigate to="/examiner" replace />;
    }
    return <Navigate to="/aspirant" replace />;
  }

  return children;
};

export default ProtectedRoute;
