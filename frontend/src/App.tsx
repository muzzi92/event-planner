import React, { useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProjectListPage from './components/ProjectListPage';
import ProjectDetailsPage from './components/ProjectDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppNavbar from './components/Navbar'; // Import the new Navbar

// A layout for protected pages that includes the Navbar
const MainLayout = ({ children }: { children: React.ReactNode }) => (
    <>
        <AppNavbar />
        <div className="container mt-4">
            {children}
        </div>
    </>
);

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleSetToken = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage setToken={handleSetToken} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={token ? <Navigate to="/projects" /> : <Navigate to="/login" />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/projects" element={<MainLayout><ProjectListPage /></MainLayout>} />
          <Route path="/projects/:id" element={<MainLayout><ProjectDetailsPage /></MainLayout>} />
        </Route>
      </Routes>
  );
}

export default App;