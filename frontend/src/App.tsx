import { useState, useEffect } from 'react'
import './App.css'
import Auth from './components/Auth'
import Patients from './components/Patients'
import Evaluations from './components/Evaluations'
import API_BASE_URL from './apiConfig'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'evaluations'>('dashboard')
  const [evalPatientId, setEvalPatientId] = useState<number | null>(null)
  const [message, setMessage] = useState('Cargando desde Django...')

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/api/test/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
        .then(res => res.json())
        .then(data => setMessage(data.message))
        .catch(() => setMessage('Error conectando a Django'))
    }
  }, [token])

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) {
    return <Auth onLogin={handleLogin} />
  }

  return (
    <>
      <div className="dashboard">
        <div className="top-nav">
          <div className="nav-left">
            <span className="brand">ComunicaFono</span>
            <div className="nav-links">
              <button
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Inicio
              </button>
              <button
                className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`}
                onClick={() => setActiveTab('patients')}
              >
                Pacientes
              </button>
              <button
                className={`nav-link ${activeTab === 'evaluations' ? 'active' : ''}`}
                onClick={() => {
                  setEvalPatientId(null);
                  setActiveTab('evaluations');
                }}
              >
                Evaluaciones
              </button>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">Salir</button>
        </div>
        <div className="main-content">
          {activeTab === 'dashboard' && (
            <>
              <h1>Vite + Django</h1>
              <div className="card">
                <p>Mensaje del servidor: <strong>{message}</strong></p>
              </div>
            </>
          )}
          {activeTab === 'patients' && (
            <Patients
              token={token}
              onSelectForEval={(id: number) => {
                setEvalPatientId(id);
                setActiveTab('evaluations');
              }}
            />
          )}
          {activeTab === 'evaluations' && <Evaluations token={token} defaultPatientId={evalPatientId} />}
        </div>
      </div>
    </>
  )
}

export default App
