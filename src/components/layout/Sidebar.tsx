'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  BarChart3,
  Settings,
  PlusCircle,
  LogOut,
  Building2,
  FilePlus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean; setMobileOpen?: (val: boolean) => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-100">SHRINIVAS</h1>
            <p className="text-xs font-medium text-blue-400">GST Billing System</p>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="p-4">
          <Link
            href="/invoices/create"
            onClick={() => setMobileOpen?.(false)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-[0.98]"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Create Invoice</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen?.(false)}
                className={`group flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/10 font-semibold text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout footer */}
        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
              {user?.email?.slice(0, 2).toUpperCase() || 'SE'}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-slate-200">{user?.email || 'admin@shrinivas.com'}</p>
              <p className="text-[10px] text-slate-500">Authorized User</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-850 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
