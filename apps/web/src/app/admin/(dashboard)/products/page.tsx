"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, RotateCcw, Edit, Eye, Trash2, 
  Package, CheckCircle, AlertCircle, TrendingDown,
  ChevronLeft, ChevronRight, ChevronDown, Check, X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [stockFilter, setStockFilter] = useState('All Stock Status');
  const [priceFilter, setPriceFilter] = useState('All Price');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    basePrice: 0,
    b2bPrice: '',
    stock: 0,
    isActive: true,
    categoryIds: [] as string[],
    imageUrl: ''
  });
  const [formSaving, setFormSaving] = useState(false);

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/categories`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const sorted = data.sort((a: any, b: any) => a.name.localeCompare(b.name));
          setAllCategories(sorted);
        }
      } catch (e) {}
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        description: product.description || '',
        basePrice: product.basePrice || 0,
        b2bPrice: product.b2bPrice || '',
        stock: product.stock || 0,
        isActive: product.isActive !== false,
        categoryIds: product.categories?.map((c: any) => c.id) || (product.category?.id ? [product.category.id] : []),
        imageUrl: product.images?.[0]?.url || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        sku: '',
        description: '',
        basePrice: 0,
        b2bPrice: '',
        stock: 0,
        isActive: true,
        categoryIds: [],
        imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/${editingProduct.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        // refetch products
        const productsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products`, { cache: 'no-store' });
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data);
        }
        closeModal();
        setNotification({ message: "Product saved successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to save product.", type: "error" });
      }
    } catch (error) {
      console.error("Save error:", error);
      setNotification({ message: "An error occurred during saving.", type: "error" });
    } finally {
      setFormSaving(false);
    }
  };
  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setNotification({ message: "Product deleted successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to delete product. It may be referenced in orders.", type: "error" });
      }
    } catch (e) {
      console.error(e);
      setNotification({ message: "An error occurred.", type: "error" });
    } finally {
      setDeleteConfirm({isOpen: false, id: null});
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
        setNotification({ message: "Selected products deleted successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to delete selected products.", type: "error" });
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      setNotification({ message: "An error occurred during deletion.", type: "error" });
    } finally {
      setBulkDeleteConfirm(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products locally
  const filteredProducts = products.filter(product => {
    // Search
    if (search && !product.name.toLowerCase().includes(search.toLowerCase()) && !(product.sku && product.sku.toLowerCase().includes(search.toLowerCase()))) {
      return false;
    }
    // Category
    if (categoryFilter !== 'All Categories') {
      const hasCategory = product.categories?.some((c: any) => c.name === categoryFilter) || product.category?.name === categoryFilter;
      if (!hasCategory) return false;
    }
    // Status
    if (statusFilter === 'Active' && !product.isActive) return false;
    if (statusFilter === 'Inactive' && product.isActive) return false;
    
    // Stock Status
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 10;
    const isInStock = product.stock > 10;
    
    if (stockFilter === 'Out of Stock' && !isOutOfStock) return false;
    if (stockFilter === 'Low Stock' && !isLowStock) return false;
    if (stockFilter === 'In Stock' && !isInStock) return false;
    
    // Price Range
    if (priceFilter === 'Under ₹500' && product.basePrice >= 500) return false;
    if (priceFilter === 'Over ₹1000' && product.basePrice <= 1000) return false;
    if (priceFilter === '₹500 - ₹1000' && (product.basePrice < 500 || product.basePrice > 1000)) return false;
    
    return true;
  });

  // Calculate KPIs based on FILTERED products
  const kpis = {
    total: filteredProducts.length,
    active: filteredProducts.filter((p: any) => p.isActive).length,
    outOfStock: filteredProducts.filter((p: any) => p.stock === 0).length,
    lowStock: filteredProducts.filter((p: any) => p.stock > 0 && p.stock <= 10).length,
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-[#C89F5F]">Products</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setBulkDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={() => openModal()}
            className="bg-[#3A1E14] hover:bg-[#2A080C] text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add New Product
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-600">
            <Package size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.total}</p>
            <p className="text-[11px] text-gray-400 mt-1">All time products</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50 text-green-600">
            <CheckCircle size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Active Products</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.active}</p>
            <p className="text-[11px] text-gray-400 mt-1">Visible on store</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-50 text-red-600">
            <AlertCircle size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Out of Stock</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.outOfStock}</p>
            <p className="text-[11px] text-gray-400 mt-1">Not available</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-yellow-50 text-yellow-600">
            <TrendingDown size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Low Stock</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{kpis.lowStock}</p>
            <p className="text-[11px] text-gray-400 mt-1">Threshold below 10</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#C89F5F]"
            />
          </div>
        </div>
        <div className="w-[160px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Category</label>
          <div className="relative">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:border-[#C89F5F]">
              <option>All Categories</option>
              {Array.from(new Set(products.flatMap(p => p.categories?.length ? p.categories.map((c: any) => c.name) : [p.category?.name]).filter(Boolean))).map(cat => (
                <option key={cat as string}>{cat as string}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="w-[140px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Status</label>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:border-[#C89F5F]">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="w-[150px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Stock Status</label>
          <div className="relative">
            <select 
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:border-[#C89F5F]">
              <option>All Stock Status</option>
              <option>In Stock</option>
              <option>Out of Stock</option>
              <option>Low Stock</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="w-[140px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Price Range</label>
          <div className="relative">
            <select 
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:border-[#C89F5F]">
              <option>All Price</option>
              <option>Under ₹500</option>
              <option>₹500 - ₹1000</option>
              <option>Over ₹1000</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setSearch('');
              setCategoryFilter('All Categories');
              setStatusFilter('All Status');
              setStockFilter('All Stock Status');
              setPriceFilter('All Price');
            }}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <RotateCcw size={16} />
            Reset
          </button>
          <button className="bg-[#3A1E14] hover:bg-[#2A080C] text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#C89F5F] focus:ring-[#C89F5F]" 
                      checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredProducts.map(p => p.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                    />
                </th>
                <th className="p-4 font-bold">Product</th>
                <th className="p-4 font-bold">SKU</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold">Stock</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Created At</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-[#C89F5F] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-500 text-sm">Loading products...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-gray-500 text-sm">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const dateInfo = formatDate(product.createdAt);
                  const isLowStock = product.stock > 0 && product.stock <= 10;
                  const isOutOfStock = product.stock === 0;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-[#C89F5F] focus:ring-[#C89F5F]" 
                          checked={selectedIds.includes(product.id)}
                          onChange={() => {
                            setSelectedIds(prev => 
                              prev.includes(product.id)
                                ? prev.filter(id => id !== product.id)
                                : [...prev, product.id]
                            );
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3 max-w-[280px]">
                          <div className="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                            <Image 
                              src={product.images?.[0]?.url || '/images/hero-cake.png'} 
                              alt={product.name} 
                              fill 
                              sizes="48px"
                              className="object-cover" 
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 font-medium">{product.sku || 'N/A'}</td>
                      <td className="p-4">
                        <select 
                          className="w-full text-[11px] border border-gray-200 rounded p-1.5 text-[#C89F5F] font-semibold bg-orange-50 focus:outline-none focus:border-[#C89F5F] cursor-pointer"
                          value={product.categories?.[0]?.id || product.category?.id || ""}
                          onChange={async (e) => {
                            const newCatId = e.target.value;
                            // Optimistically update locally
                            setProducts(prev => prev.map(p => {
                              if (p.id === product.id) {
                                const newCat = allCategories.find(c => c.id === newCatId);
                                return { ...p, categories: newCat ? [newCat] : [] };
                              }
                              return p;
                            }));
                            // API call to update
                            try {
                              await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/${product.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ categoryIds: newCatId ? [newCatId] : [] })
                              });
                            } catch(err) {
                              console.error(err);
                            }
                          }}
                        >
                          <option value="">Uncategorized</option>
                          {allCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900">₹{product.basePrice}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {product.stock}
                          </span>
                          <span className={`text-[10px] font-medium ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-yellow-500' : 'text-green-500'}`}>
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${product.isActive ? 'bg-[#3A1E14]' : 'bg-gray-200'}`}
                            onClick={async () => {
                              const newStatus = !product.isActive;
                              // Update locally
                              setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: newStatus } : p));
                              try {
                                await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/${product.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ isActive: newStatus })
                                });
                              } catch(err) {
                                console.error(err);
                                // Revert on error
                                setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !newStatus } : p));
                              }
                            }}
                          >
                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${product.isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </div>
                          <span className={`text-xs font-medium ${product.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900 font-medium">{dateInfo.date}</span>
                          <span className="text-[10px] text-gray-500">{dateInfo.time}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openModal(product)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#C89F5F] hover:bg-orange-50 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <Link href={`/product/${product.slug}`} target="_blank" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Eye size={16} />
                          </Link>
                          <button 
                            onClick={() => setDeleteConfirm({isOpen: true, id: product.id})}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
          <p className="text-xs text-gray-500 font-medium">
            Showing 1 to {filteredProducts.length} of {filteredProducts.length} products
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#3A1E14] text-white font-medium text-xs">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F] text-xs transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F] text-xs transition-colors">3</button>
              <span className="text-gray-400 mx-1">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F] text-xs transition-colors">15</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-[#C89F5F] hover:text-[#C89F5F] transition-colors ml-1">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Rows per page:</span>
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-200 rounded-lg py-1.5 pl-3 pr-7 text-xs focus:outline-none focus:border-[#C89F5F]">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="productForm" onSubmit={handleSave} className="space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Product Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        if (!editingProduct) {
                          setFormData({...formData, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')});
                        } else {
                          setFormData({...formData, name});
                        }
                      }}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Slug *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-600 focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">SKU</label>
                    <input 
                      type="text" 
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                    />
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-[13px] font-semibold text-gray-700">Categories</label>
                    {/* Multi-select Dropdown UI */}
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus-within:border-[#C89F5F] focus-within:ring-1 focus-within:ring-[#C89F5F] bg-white min-h-[38px] flex flex-wrap gap-1">
                      {formData.categoryIds.map(catId => {
                        const cat = allCategories.find(c => c.id === catId);
                        return cat ? (
                          <span key={catId} className="inline-flex items-center gap-1 bg-orange-50 text-[#C89F5F] px-2 py-0.5 rounded text-xs font-medium">
                            {cat.name}
                            <button 
                              type="button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({...formData, categoryIds: formData.categoryIds.filter(id => id !== catId)});
                              }}
                              className="text-[#C89F5F] hover:text-orange-800"
                            >
                              &times;
                            </button>
                          </span>
                        ) : null;
                      })}
                      <select 
                        className="flex-1 outline-none min-w-[100px] bg-transparent"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !formData.categoryIds.includes(val)) {
                            setFormData({...formData, categoryIds: [...formData.categoryIds, val]});
                          }
                          e.target.value = "";
                        }}
                      >
                        <option value="">+ Add category...</option>
                        {allCategories.filter(c => !formData.categoryIds.includes(c.id)).map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Base Price (₹) *</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value) || 0})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">B2B Price (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Optional"
                      value={formData.b2bPrice}
                      onChange={(e) => setFormData({...formData, b2bPrice: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Stock Quantity</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Description</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Image URL</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                      <Image src={formData.imageUrl} alt="Preview" fill sizes="64px" className="object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Active Status</h4>
                    <p className="text-xs text-gray-500">Hide or show this product on the storefront</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
              <button 
                type="button" 
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="productForm"
                disabled={formSaving}
                className="bg-[#3A1E14] hover:bg-[#2A080C] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {formSaving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setDeleteConfirm({isOpen: false, id: null})}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteConfirm.id && handleDeleteProduct(deleteConfirm.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Selected Products?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete the {selectedIds.length} selected products? This action cannot be undone.</p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setBulkDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-5 duration-350">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-xs font-bold border ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 text-sm"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
