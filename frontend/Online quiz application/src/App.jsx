import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './Login'
import RegisterExaminer from './RegisterExaminer'
import RegisterAspirant from './RegisterAspirant'
import ExaminerDashboard from './ExaminerDashboard'
import AspirantDashboard from './AspirantDashboard'
import './style.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register-examiner" element={<RegisterExaminer />} />
        <Route path="/register-aspirant" element={<RegisterAspirant />} />
        <Route path="/examiner" element={<ExaminerDashboard />} />
        <Route path="/aspirant" element={<AspirantDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
