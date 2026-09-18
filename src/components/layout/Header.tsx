'use client';

import React from 'react';
import { Menu, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/context/SidebarContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, onMenuClick, actions }: HeaderProps) {
  const { toggleMobileOpen } = useSidebar();

  const handleMenuClick = onMenuClick || toggleMobileOpen;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-3 sm:px-6 lg:px-8 backdrop-blur-md no-print">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={handleMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden shrink-0"
          aria-label="Toggle Mobile Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="truncate">
          <h1 className="text-base font-bold text-slate-900 sm:text-xl truncate">{title}</h1>
          {subtitle && <p className="hidden text-xs text-slate-500 sm:block truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actions ? (
          actions
        ) : (
          <Link
            href="/invoices/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 sm:px-3.5 sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Invoice</span>
            <span className="sm:hidden">New</span>
          </Link>
        )}
      </div>
    </header>
  );
}
