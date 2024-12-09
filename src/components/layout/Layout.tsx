import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6 mt-16">{children}</main>
      </div>
    </div>
  );
};

export default Layout;