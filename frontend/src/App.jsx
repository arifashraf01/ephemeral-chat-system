import { Routes, Route } from 'react-router-dom'
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
      <Route path="/requests" element={<Requests />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  )
}

export default App