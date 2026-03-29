import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Requests from './pages/Requests'
import Signup from './pages/Signup'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/requests"
        element={(
          <ProtectedRoute>
            <Requests />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/chat"
        element={(
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        )}
      />
    </Routes>
  )
}

export default App