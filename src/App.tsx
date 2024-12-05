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
import StockRequests from "./pages/StockRequests";
import Invoices from "./pages/Invoices";
import QuickSearch from "./components/layout/QuickSearch"; // Import QuickSearch component
import { Toaster } from "react-hot-toast";

export const menuItems = [
  { label: "Dashboard", path: "/" },
  { label: "Inventory", path: "/inventory" },
  { label: "Orders", path: "/orders" },
  { label: "Stock Requests", path: "/stock-requests" },
  { label: "Reports", path: "/reports" },
  { label: "Invoices", path: "/invoices" },
];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          {/* Quick Search */}
          <QuickSearch menuItems={menuItems} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {menuItems.map((item) => (
              <Route
                key={item.path}
                path={item.path}
                element={
                  <PrivateRoute>
                    {item.label === "Dashboard" && <Dashboard />}
                    {item.label === "Inventory" && <Inventory />}
                    {item.label === "Orders" && <Orders />}
                    {item.label === "Reports" && <Reports />}
                    {item.label === "Invoices" && <Invoices />}
                    {item.label === "Stock Requests" && <StockRequests />}
                  </PrivateRoute>
                }
              />
            ))}
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
