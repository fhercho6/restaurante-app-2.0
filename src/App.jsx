import React from 'react';
import AppContent from './components/AppContent';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { RegisterProvider } from './context/RegisterContext';

// MAIN APP: Wrapper de Proveedores
function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <RegisterProvider>
          <AppContent />
        </RegisterProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;