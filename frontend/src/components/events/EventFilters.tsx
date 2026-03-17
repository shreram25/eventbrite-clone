import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Category } from '../../types';

interface FiltersProps {
  categories: Category[];
  onFilter: (filters: any) => void;
}

export default function EventFilters({ categories, onFilter }: FiltersProps) {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isFree, setIsFree] = useState('');
  const [startDate, setStartDate] = useState('');

  const apply = () => {
    onFilter({
      search: search || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      isFree: isFree || undefined,
      startDate: startDate || undefined,
    });
  };

  const reset = () => {
    setSearch('');
    setCategoryId('');
    setIsFree('');
    setStartDate('');
    onFilter({});
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && apply()}
              placeholder="Event name, location..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category */}
        <div className="min-w-36">
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="min-w-32">
          <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
          <select
            value={isFree}
            onChange={(e) => setIsFree(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Any Price</option>
            <option value="true">Free</option>
            <option value="false">Paid</option>
          </select>
        </div>

        {/* Date */}
        <div className="min-w-36">
          <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={apply}
            className="flex items-center gap-1.5 bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors"
          >
            <Filter size={14} /> Apply
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <X size={14} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
