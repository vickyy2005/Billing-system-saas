'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '@/types';
import { DataStore } from '@/lib/supabase/store';
import { Search, Building2, MapPin, Phone, Check, RefreshCw } from 'lucide-react';

interface CustomerAutocompleteProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  onClearCustomer: () => void;
}

export function CustomerAutocomplete({
  selectedCustomer,
  onSelectCustomer,
  onClearCustomer,
}: CustomerAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced database search
  useEffect(() => {
    if (!query.trim() || selectedCustomer) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await DataStore.getCustomers(query);
        setResults(data);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Error in customer autocomplete:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selectedCustomer]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (customer: Customer) => {
    onSelectCustomer(customer);
    setQuery('');
    setIsOpen(false);
  };

  // Helper to highlight matching text
  const highlightMatch = (text?: string) => {
    if (!text || !query.trim()) return text || '';
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-slate-900 rounded font-bold px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  if (selectedCustomer) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{selectedCustomer.company_name}</h3>
              <p className="text-[11px] font-mono text-blue-700 font-semibold">
                GSTIN: {selectedCustomer.gstin || 'UNREGISTERED'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearCustomer}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Change Customer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs pt-2 border-t border-blue-100 text-slate-700">
          <div>
            <span className="font-semibold text-slate-500">Contact:</span> {selectedCustomer.contact_person || '—'} ({selectedCustomer.phone})
          </div>
          <div>
            <span className="font-semibold text-slate-500">Billing Address:</span>{' '}
            {selectedCustomer.billing_city}, {selectedCustomer.billing_state} ({selectedCustomer.billing_state_code || '27'})
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        Search Customer (Company Name, GSTIN, or Phone) *
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type e.g. 'raj', 'rajdeep', or GSTIN number..."
          className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-2xl">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-500 text-center">
              No matching customers found for &quot;{query}&quot;
            </div>
          ) : (
            results.map((c, index) => (
              <div
                key={c.id}
                onClick={() => handleSelect(c)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`cursor-pointer px-4 py-2.5 text-xs transition border-b border-slate-100 last:border-none ${
                  selectedIndex === index ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{highlightMatch(c.company_name)}</span>
                  <span className="font-mono text-[11px] text-slate-500">{highlightMatch(c.gstin)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>{c.billing_city}, {c.billing_state}</span>
                  <span>Ph: {highlightMatch(c.phone)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
