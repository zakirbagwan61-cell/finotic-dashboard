import './App.css'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <Dashboard />
      </div>
    </div>
  )
}