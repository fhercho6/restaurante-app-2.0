// src/main.jsx - EDICIÓN ESPECIAL: MODO DIAGNÓSTICO
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// --- COMPONENTE CAZADOR DE ERRORES ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la UI alternativa
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("🔥 ERROR CAPTURADO EN MAIN:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier interfaz de repuesto personalizada
      return (
        <div style={{ 
          padding: '40px', 
          backgroundColor: '#fee2e2', 
          color: '#7f1d1d', 
          height: '100vh', 
          width: '100vw',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h1 style={{fontSize: '32px', marginBottom: '10px'}}>⚠️ EL SISTEMA FALLÓ</h1>
          <p style={{fontSize: '18px', marginBottom: '20px'}}>
            No te preocupes, el error está aquí abajo. <br/>
            <strong>Tómale una foto a esto y envíamela.</strong>
          </p>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '2px solid #ef4444', 
            maxWidth: '800px',
            width: '90%',
            overflow: 'auto',
            textAlign: 'left',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{color: '#dc2626', fontWeight: 'bold', fontSize: '16px', marginBottom: '10px'}}>
              {this.state.error && this.state.error.toString()}
            </h3>
            <pre style={{ 
              fontSize: '12px', 
              color: '#333', 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word' 
            }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>

          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '30px', 
              padding: '15px 30px', 
              backgroundColor: '#dc2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            INTENTAR REINICIAR
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)