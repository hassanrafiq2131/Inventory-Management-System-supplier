import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  FileText,
  Receipt,
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Package, label: "Inventory", path: "/inventory" },
    { icon: ClipboardList, label: "Orders", path: "/orders" },
    { icon: FileText, label: "Reports", path: "/reports" },
    { icon: Receipt, label: "Invoices", path: "/invoices" },
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Inventory Management System
        </h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                  : ""
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
