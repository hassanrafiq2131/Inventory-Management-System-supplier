import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Bell, Settings } from 'lucide-react';

const Header = () => {
  const auth = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => auth?.logout()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {auth?.currentUser?.email?.[0].toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {auth?.currentUser?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;