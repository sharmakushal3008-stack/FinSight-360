import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  CheckCircle2,
  Percent,
  Shield,
  CreditCard,
  Building,
  Car,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import api from '../services/api';

const categoryIcons = {
  'Savings & Deposits': Building,
  'Vehicle Financing': Car,
  'Home Financing': Building,
  'Credit Cards': CreditCard,
  'Wealth & Investments': TrendingUp,
  'Insurance & Protection': Shield,
  'SME Business Loan': Package,
};

const ProductCatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (search) params.append('search', search);

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Banking Solution Catalog</h1>
            <p className="text-xs text-slate-500">
              Generic product offerings with suitability criteria and benefits
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </form>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 w-full sm:w-auto"
        >
          <option value="All">All Categories</option>
          <option value="Savings & Deposits">Savings & Deposits</option>
          <option value="Vehicle Financing">Vehicle Financing</option>
          <option value="Home Financing">Home Financing</option>
          <option value="Credit Cards">Credit Cards</option>
          <option value="Wealth & Investments">Wealth & Investments</option>
          <option value="Insurance & Protection">Insurance & Protection</option>
          <option value="SME Business Loan">SME Business Loan</option>
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-500">Loading solutions catalog...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No products found matching query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((prod) => {
            const Icon = categoryIcons[prod.category] || Package;

            return (
              <div
                key={prod._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-card transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-slate-900 text-sm">{prod.name}</h3>
                        <span className="text-[10px] text-slate-500">{prod.category}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700">Aligned Need:</span>{' '}
                      <span className="text-slate-600">{prod.customerNeed}</span>
                    </div>
                    {prod.interestRateOrBenefit && (
                      <div>
                        <span className="font-semibold text-slate-700">Key Benefit:</span>{' '}
                        <span className="text-emerald-700 font-medium">{prod.interestRateOrBenefit}</span>
                      </div>
                    )}
                    {prod.eligibilityCriteria && (
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        Criteria: {prod.eligibilityCriteria}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Product Code: <strong className="font-mono text-slate-600">{prod.productId}</strong></span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium">
                    {prod.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductCatalogPage;
