import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MCPProvider } from "./context/MCPContext";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PlayerDetail from "./pages/PlayerDetail";
import PlayerComparison from "./pages/PlayerComparison";
import Reports from "./pages/Reports";
import ReportDetail from "./pages/ReportDetail";
import AnalisisIA from "./pages/AnalisisIA";

function App() {
  return (
    <Router>
      <MCPProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players"
            element={
              <ProtectedRoute>
                <Players />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players/:id"
            element={
              <ProtectedRoute>
                <PlayerDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comparison"
            element={
              <ProtectedRoute>
                <PlayerComparison />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:id"
            element={
              <ProtectedRoute>
                <ReportDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analisis-ia"
            element={
              <ProtectedRoute>
                <AnalisisIA />
              </ProtectedRoute>
            }
          />
          </Routes>
        </div>
      </MCPProvider>
    </Router>
  );
}

export default App;
