import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, FileText, BarChart3, Zap, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserMenuProps {
  user: any;
  onSignOut: () => void;
  onNavigate: (view: string) => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onSignOut, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onSignOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      icon: FileText,
      label: 'Dashboard',
      action: () => {
        onNavigate('dashboard');
        setIsOpen(false);
      }
    },
    {
      icon: FileText,
      label: 'Cover Letters',
      action: () => {
        onNavigate('cover-letters');
        setIsOpen(false);
      }
    },
    {
      icon: BarChart3,
      label: 'Resume Analyzer',
      action: () => {
        onNavigate('analyzer');
        setIsOpen(false);
      }
    },
    {
      icon: Settings,
      label: 'Settings',
      action: () => {
        onNavigate('settings');
        setIsOpen(false);
      }
    }
  ];

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user.email;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {getInitials(user.email)}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
            {getDisplayName()}
          </p>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="text-xs text-amber-600 font-medium">Pro</span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {getInitials(user.email)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-amber-600 font-medium">Pro Plan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <item.icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;