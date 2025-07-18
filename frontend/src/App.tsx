import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PlayerDetail from './pages/PlayerDetail';
import PlayerComparison from './pages/PlayerComparison';

function App() {
  return (
    <Router>
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
          <Route path="/players/:id" element={<PlayerDetail />} />
          <Route path="/comparison" element={<PlayerComparison />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App