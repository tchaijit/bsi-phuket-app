'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/partners', icon: Users, label: 'Partners' },
    { to: '/map', icon: MapPin, label: 'Map View' },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[998]"
          onClick={onToggle}
        />
      )}

      <aside className={`
        bg-white border-r border-gray-200 h-screen sticky top-0 z-[999]
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-0 md:w-16'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        fixed md:relative
      `}>
        <div className={`p-6 ${!isOpen ? 'hidden md:block md:p-2' : ''}`}>
          {/* Logo/Header */}
          {isOpen ? (
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-600 p-2 rounded-lg">
                <span className="text-white font-bold text-lg">BSI</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-800">BSI Phuket</h2>
                <p className="text-xs text-gray-500">Contract Management</p>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center justify-center mb-8">
              <div className="bg-blue-600 p-2 rounded-lg">
                <span className="text-white font-bold text-sm">B</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`flex items-center gap-3 rounded-lg transition ${
                    isOpen ? 'px-4 py-3' : 'md:px-2 md:py-3 md:justify-center px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={!isOpen ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className={isOpen ? '' : 'md:hidden'}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors hidden md:block"
          aria-label="Toggle sidebar"
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </aside>
    </>
  );
}
