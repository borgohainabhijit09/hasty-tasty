"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, RotateCcw, Edit, Trash2, 
  Grid, ChevronDown, X, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const processedCategories = categories.filter(c => {
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase()) && !c.slug.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterType === 'B2B' && !c.isB2B) return false;
    if (filterType === 'B2C' && !c.isB2C) return false;
    if (filterStatus === 'ACTIVE' && c.isActive === false) return false;
    if (filterStatus === 'INACTIVE' && c.isActive !== false) return false;
    return true;
  });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    isActive: true,
    isB2C: true,
    isB2B: false
  });
  const [formSaving, setFormSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/categories`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const openModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        imageUrl: category.imageUrl || '',
        isActive: category.isActive !== false,
        isB2C: category.isB2C !== false,
        isB2B: category.isB2B === true
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        imageUrl: '',
        isActive: true,
        isB2C: true,
        isB2B: false
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/categories/${editingCategory.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/categories`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await fetchCategories();
        closeModal();
        setNotification({ message: "Category saved successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to save category.", type: "error" });
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setFormSaving(false);
    }
  };

  const toggleCategoryStatus = async (category: any) => {
    try {
      // Optimistic update
      setCategories(cats => cats.map(c => c.id === category.id ? { ...c, isActive: !c.isActive } : c));
      
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, isActive: !category.isActive })
      });
    } catch (error) {
      console.error("Toggle error:", error);
      // Revert on error
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        setNotification({ message: "Category deleted successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to delete category.", type: "error" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      setNotification({ message: "An error occurred.", type: "error" });
    } finally {
      setDeleteConfirm({isOpen: false, id: null});
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/categories/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => !selectedIds.includes(c.id)));
        setSelectedIds([]);
        setNotification({ message: "Selected categories deleted successfully!", type: "success" });
      } else {
        setNotification({ message: "Failed to delete selected categories.", type: "error" });
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      setNotification({ message: "An error occurred during deletion.", type: "error" });
    } finally {
      setBulkDeleteConfirm(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto pb-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-[#C89F5F]">Categories</span>
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
            Add New Category
          </button>
        </div>
      </div>

      {/* KPI/Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600">
            <Grid size={26} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Categories</h3>
            <p className="text-2xl font-bold text-gray-900 leading-none">{categories.length}</p>
            <p className="text-[11px] text-gray-400 mt-1">{categories.filter(c => c.isActive).length} active categories</p>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by category name or slug..." 
              className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#C89F5F]"
            />
          </div>
        </div>
        <div className="w-[150px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Type</label>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#C89F5F]"
          >
            <option value="ALL">All Types</option>
            <option value="B2C">Retail (B2C)</option>
            <option value="B2B">Wholesale (B2B)</option>
          </select>
        </div>
        <div className="w-[150px]">
          <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Status</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#C89F5F]"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {setSearchTerm(''); setFilterType('ALL'); setFilterStatus('ALL');}}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                   <input 
                     type="checkbox" 
                     className="rounded border-gray-300 text-[#C89F5F] focus:ring-[#C89F5F]" 
                     checked={processedCategories.length > 0 && selectedIds.length === processedCategories.length}
                     onChange={(e) => {
                       if (e.target.checked) {
                         setSelectedIds(processedCategories.map(c => c.id));
                       } else {
                         setSelectedIds([]);
                       }
                     }}
                   />
                </th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Slug</th>
                <th className="p-4 font-bold text-center">Products</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-[#C89F5F] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-500 text-sm">Loading categories...</p>
                  </td>
                </tr>
              ) : processedCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-500 text-sm">
                    No categories found.
                  </td>
                </tr>
              ) : (
                processedCategories.map((category) => {
                  return (
                    <tr key={category.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-[#C89F5F] focus:ring-[#C89F5F]" 
                          checked={selectedIds.includes(category.id)}
                          onChange={() => {
                            setSelectedIds(prev => 
                              prev.includes(category.id)
                                ? prev.filter(id => id !== category.id)
                                : [...prev, category.id]
                            );
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden relative">
                            {category.imageUrl ? (
                              <Image src={category.imageUrl} alt={category.name} fill className="object-cover" sizes="48px" />
                            ) : (
                              <ImageIcon size={20} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{category.name}</p>
                            <p className="text-xs text-gray-500 max-w-[200px] truncate">{category.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                         <div className="flex flex-col gap-2">
                           <span className="inline-flex w-fit items-center px-2 py-1 rounded-md text-[11px] font-mono bg-gray-100 text-gray-600">
                             {category.slug}
                           </span>
                           <div className="flex gap-1">
                             {category.isB2C && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 tracking-wider">RETAIL</span>}
                             {category.isB2B && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-600 tracking-wider">B2B</span>}
                           </div>
                         </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center bg-orange-50 text-[#C89F5F] font-bold rounded-full w-8 h-8 text-xs">
                          {category.product_count || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={category.isActive !== false}
                            onChange={() => toggleCategoryStatus(category)}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(category)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#C89F5F] hover:bg-orange-50 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm({isOpen: true, id: category.id})}
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
            Showing 1 to {processedCategories.length} of {processedCategories.length} categories
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#3A1E14] text-white font-medium text-xs">1</button>
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="categoryForm" onSubmit={handleSave} className="space-y-5">
                
                {/* Image Preview & Upload (Simplified to URL for now) */}
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-300" size={32} />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Image URL</label>
                    <input 
                      type="text" 
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                    />
                    <p className="text-[11px] text-gray-500">Provide a direct URL to the category image.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Category Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        // Auto generate slug if creating new
                        if (!editingCategory) {
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

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Description</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F] focus:ring-1 focus:ring-[#C89F5F]"
                  ></textarea>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Active Status</h4>
                    <p className="text-xs text-gray-500">Hide or show this category entirely</p>
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

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Retail (B2C) Storefront</h4>
                    <p className="text-xs text-gray-500">Show this category to regular retail customers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isB2C}
                      onChange={(e) => setFormData({...formData, isB2C: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Wholesale (B2B) Portal</h4>
                    <p className="text-xs text-gray-500">Show this category on the B2B ordering portal</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isB2B}
                      onChange={(e) => setFormData({...formData, isB2B: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
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
                form="categoryForm"
                disabled={formSaving}
                className="bg-[#3A1E14] hover:bg-[#2A080C] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {formSaving ? 'Saving...' : 'Save Category'}
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Category?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setDeleteConfirm({isOpen: false, id: null})}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteConfirm.id && handleDeleteCategory(deleteConfirm.id)}
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Selected Categories?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete the {selectedIds.length} selected categories? This action cannot be undone.</p>
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
