import { useState, useEffect } from 'react'
import './App.css'
import Auth from './components/Auth'
import Patients from './components/Patients'
import Evaluations from './components/Evaluations'
import TestTemplates from './components/TestTemplates'
import CalendarView from './components/CalendarView'
import API_BASE_URL from './apiConfig'
import { useRegisterSW } from 'virtual:pwa-register/react'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'evaluations' | 'templates' | 'calendar'>('dashboard')
  const [evalPatientId, setEvalPatientId] = useState<number | null>(null)
  const [message, setMessage] = useState('Cargando desde Django...')

  // Setup PWA Service Worker Hook
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

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
              <button
                className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveTab('calendar')}
              >
                Turnos
              </button>
              <button
                className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
                onClick={() => setActiveTab('templates')}
              >
                Plantillas
              </button>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">Salir</button>
        </div>
        <div className="main-content">
          {needRefresh && (
            <div className="pwa-toast">
              <div className="pwa-message">
                <span>Nueva actualización disponible.</span>
              </div>
              <button className="btn-primary" onClick={() => updateServiceWorker(true)}>Recargar</button>
              <button className="btn-secondary" onClick={() => setNeedRefresh(false)}>Cerrar</button>
            </div>
          )}
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
          {activeTab === 'templates' && <TestTemplates token={token} />}
          {activeTab === 'calendar' && <CalendarView token={token} onClose={() => setActiveTab('dashboard')} />}
        </div>
      </div>
    </>
  )
}

export default App
