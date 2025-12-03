import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import WelcomePage from './pages/Login.jsx';
import CalculatorPage from './pages/Calculator.jsx';
import BrandPage from './pages/Brand.jsx';
import AdminPanel from './pages/Admin.jsx';
import Results from './pages/Results.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/calculator/:brand" element={<BrandPage />} />
            <Route path="/results/:brand/:model/:type/:engine" element={<Results />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}