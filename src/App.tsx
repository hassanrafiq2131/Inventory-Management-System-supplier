import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Invoices from "./pages/Invoices";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <PrivateRoute>
                  <Inventory />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <PrivateRoute>
                  <Invoices />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
