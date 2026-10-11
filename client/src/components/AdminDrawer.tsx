import React, { useEffect, useState } from 'react';
import {
  X,
  RefreshCw,
  Download,
  Mail,
  CheckCircle2,
  AlertCircle,
  Shield,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  Lock,
  Layers,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { PRODUCT_CONFIG } from '../config/productConfig';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProductChanged?: () => void;
}

interface OrderRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  utrNumber: string;
  amount: number;
  productTitle: string;
  emailSent: number;
  emailPreviewUrl?: string;
  createdAt: string;
  downloadToken: string;
}

interface ProductItem {
  id: string;
  name: string;
  headline: string;
  question: string;
  description: string;
  price: number;
  coverImage: string;
  fileName: string;
  whatsIncluded: string[];
  isActive: number;
  updatedAt: string;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({ isOpen, onClose, onProductChanged }) => {
  // Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [loginEmail, setLoginEmail] = useState('suvarnalathasivaramakrishnan@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab: 'orders' | 'products'
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('products');

  // Orders state
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Products CRUD state
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form fields for create/edit
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    question: '',
    description: '',
    price: 499,
    coverImage: '/images/product_cover.jpg',
    fileName: 'Build_A_Side_Hustle_Before_Graduation_GENXT.pdf',
    whatsIncludedText: '',
  });

  // Check saved session
  useEffect(() => {
    const savedToken = localStorage.getItem('genxt_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Fetch data on open or auth
  useEffect(() => {
    if (isOpen && isAdminAuthenticated) {
      fetchOrders();
      fetchProducts();
    }
  }, [isOpen, isAdminAuthenticated]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      setAdminToken(data.token);
      setIsAdminAuthenticated(true);
      localStorage.setItem('genxt_admin_token', data.token);
      showToast('Admin session unlocked!');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('genxt_admin_token');
    setAdminToken('');
    setIsAdminAuthenticated(false);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Open Edit Product
  const startEditing = (p: ProductItem) => {
    setEditingProduct(p);
    setIsCreatingNew(false);
    setFormData({
      name: p.name,
      headline: p.headline,
      question: p.question,
      description: p.description,
      price: p.price,
      coverImage: p.coverImage,
      fileName: p.fileName,
      whatsIncludedText: p.whatsIncluded.join('\n'),
    });
  };

  // Open Create New Product
  const startCreating = () => {
    setEditingProduct(null);
    setIsCreatingNew(true);
    setFormData({
      name: 'NEW DIGITAL GUIDE',
      headline: 'BUILD A DIGITAL ASSET',
      question: 'Ready to build your next income stream?',
      description: 'Step-by-step digital guide to create and sell digital products.',
      price: 499,
      coverImage: '/images/product_cover.jpg',
      fileName: 'Build_A_Side_Hustle_Before_Graduation_GENXT.pdf',
      whatsIncludedText: 'Comprehensive digital guide\nWorksheets and checklists\nInstant delivery & download',
    });
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const includedArray = formData.whatsIncludedText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (isCreatingNew) {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': adminToken,
          },
          body: JSON.stringify({
            name: formData.name,
            headline: formData.headline,
            question: formData.question,
            description: formData.description,
            price: Number(formData.price),
            coverImage: formData.coverImage,
            fileName: formData.fileName,
            whatsIncluded: includedArray,
            isActive: 0,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Product created successfully!');
          setIsCreatingNew(false);
          fetchProducts();
          if (onProductChanged) onProductChanged();
        } else {
          showToast(data.message || 'Failed to create');
        }
      } else if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': adminToken,
          },
          body: JSON.stringify({
            name: formData.name,
            headline: formData.headline,
            question: formData.question,
            description: formData.description,
            price: Number(formData.price),
            coverImage: formData.coverImage,
            fileName: formData.fileName,
            whatsIncluded: includedArray,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Product updated successfully!');
          setEditingProduct(null);
          fetchProducts();
          if (onProductChanged) onProductChanged();
        } else {
          showToast(data.message || 'Failed to update');
        }
      }
    } catch (err) {
      showToast('Error saving product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Product deleted');
        fetchProducts();
        if (onProductChanged) onProductChanged();
      } else {
        showToast(data.message || 'Failed to delete');
      }
    } catch (err) {
      showToast('Error deleting product');
    }
  };

  // Activate Product
  const handleActivateProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}/activate`, {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Product activated on website!');
        fetchProducts();
        if (onProductChanged) onProductChanged();
      }
    } catch (err) {
      showToast('Error activating product');
    }
  };

  // Resend Email
  const handleResendEmail = async (orderId: string) => {
    setResendingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/resend-email`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Email successfully resent!');
        fetchOrders();
      } else {
        showToast(data.message || 'Failed to resend');
      }
    } catch (err) {
      showToast('Network error');
    } finally {
      setResendingId(null);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (orders.length === 0) return;
    const headers = ['Order ID', 'Full Name', 'Email', 'Phone', 'UTR Number', 'Amount', 'Date', 'Email Sent'];
    const rows = orders.map((o) => [
      o.id,
      `"${o.fullName}"`,
      `"${o.email}"`,
      `"${o.phone || ''}"`,
      `"${o.utrNumber}"`,
      o.amount,
      `"${o.createdAt}"`,
      o.emailSent ? 'Yes' : 'No',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `genxt-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-full bg-[#09090e] border-l border-white/10 flex flex-col text-white shadow-2xl">
        
        {/* Top Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0e0e16]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#6452f6]/20 text-[#8c7dff]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black">GENXT Admin Workspace</h3>
              <p className="text-xs text-zinc-400 font-mono">
                Admin: {PRODUCT_CONFIG.adminEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs text-zinc-400 hover:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                Lock Session
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center font-bold">
            {toastMsg}
          </div>
        )}

        {/* Content */}
        {!isAdminAuthenticated ? (
          /* ================= ADMIN LOGIN SCREEN ================= */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-3xl bg-[#0e0e16] border border-white/10 p-8 text-center space-y-6 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-[#8c7dff] flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Admin Authentication</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Log in with your official admin email address to manage products & view customer purchases.
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#14141f] border border-white/10 text-white text-xs font-mono focus:border-[#6452f6] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">
                    Password / Access Code
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password (default: genxt2026)"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#14141f] border border-white/10 text-white text-xs focus:border-[#6452f6] outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                    Default master key: <code className="text-purple-300">genxt2026</code>
                  </span>
                </div>

                {loginError && (
                  <p className="text-xs text-rose-400 font-medium">{loginError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6452f6] hover:bg-[#5240eb] shadow-glow transition-all"
                >
                  {isLoggingIn ? 'Authenticating...' : 'Unlock Admin Dashboard'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ================= ADMIN AUTHENTICATED WORKSPACE ================= */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab navigation */}
            <div className="flex items-center justify-between px-6 border-b border-white/10 bg-[#07070a]">
              <div className="flex items-center gap-4 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-3.5 border-b-2 font-bold flex items-center gap-2 ${
                    activeTab === 'products'
                      ? 'border-[#6452f6] text-white'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-[#8c7dff]" />
                  <span>Product Manager (CRUD)</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-zinc-300">
                    {products.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3.5 border-b-2 font-bold flex items-center gap-2 ${
                    activeTab === 'orders'
                      ? 'border-[#6452f6] text-white'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Customer Purchases (SQLite)</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                    {orders.length}
                  </span>
                </button>
              </div>

              {activeTab === 'products' ? (
                <button
                  onClick={startCreating}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#6452f6] hover:bg-[#5240eb] text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Product</span>
                </button>
              ) : (
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/10 hover:bg-white/15 text-zinc-200 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>

            {/* Tab 1: Products Manager */}
            {activeTab === 'products' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Form to Edit or Create */}
                {(isCreatingNew || editingProduct) && (
                  <div className="rounded-2xl bg-[#0e0e18] border-2 border-purple-500/50 p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        {isCreatingNew ? <Plus className="w-4 h-4 text-purple-400" /> : <Edit2 className="w-4 h-4 text-purple-400" />}
                        <span>{isCreatingNew ? 'Create New Product' : `Edit Product: ${editingProduct?.name}`}</span>
                      </h4>
                      <button
                        onClick={() => {
                          setIsCreatingNew(false);
                          setEditingProduct(null);
                        }}
                        className="text-xs text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-400 font-mono mb-1">Product Title / Name</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#141420] border border-white/10 text-white font-bold outline-none focus:border-[#6452f6]"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 font-mono mb-1">Actual Selling Price (INR)</label>
                          <input
                            type="number"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#141420] border border-white/10 text-white font-mono font-bold outline-none focus:border-[#6452f6]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-400 font-mono mb-1">Cover Image URL / Path</label>
                          <input
                            type="text"
                            required
                            value={formData.coverImage}
                            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#141420] border border-white/10 text-white font-mono outline-none focus:border-[#6452f6]"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 font-mono mb-1">Digital Guide File Name</label>
                          <input
                            type="text"
                            required
                            value={formData.fileName}
                            onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#141420] border border-white/10 text-white font-mono outline-none focus:border-[#6452f6]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-mono mb-1">Headline Text</label>
                        <input
                          type="text"
                          value={formData.headline}
                          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#141420] border border-white/10 text-white outline-none focus:border-[#6452f6]"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-mono mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#141420] border border-white/10 text-white outline-none focus:border-[#6452f6]"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-mono mb-1">
                          What's Included Points (1 point per line)
                        </label>
                        <textarea
                          rows={4}
                          value={formData.whatsIncludedText}
                          onChange={(e) => setFormData({ ...formData, whatsIncludedText: e.target.value })}
                          placeholder="Point 1&#10;Point 2&#10;Point 3"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#141420] border border-white/10 text-white font-mono outline-none focus:border-[#6452f6]"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingNew(false);
                            setEditingProduct(null);
                          }}
                          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-lg bg-[#6452f6] hover:bg-[#5240eb] font-bold text-white shadow-glow"
                        >
                          {isCreatingNew ? 'Create Product' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* List of Products */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    ALL PRODUCTS IN DATABASE ({products.length})
                  </h4>

                  {products.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl bg-[#0c0c14] border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                        item.isActive
                          ? 'border-[#6452f6] shadow-glow-sm bg-gradient-to-r from-[#121024] to-[#0c0c14]'
                          : 'border-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.coverImage}
                          alt={item.name}
                          className="w-16 h-20 object-cover rounded-lg border border-white/10 bg-black shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{item.name}</h3>
                            {item.isActive ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                ACTIVE ON SITE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-zinc-500 bg-white/5">
                                INACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 max-w-md line-clamp-1">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                            <span className="text-emerald-400 font-bold">
                              ₹{item.price}
                            </span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-500">File: {item.fileName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!item.isActive && (
                          <button
                            onClick={() => handleActivateProduct(item.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Set Active</span>
                          </button>
                        )}
                        <button
                          onClick={() => startEditing(item)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item.id, item.name)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Customer Orders (Purchases) */}
            {activeTab === 'orders' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-[#07070a]">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search customer purchases by name, email, UTR, or Order ID..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#111119] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#6452f6]"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500 text-xs">
                      No customer purchases recorded yet. All verified UPI payments will appear here with instant download and email status.
                    </div>
                  ) : (
                    orders
                      .filter(
                        (o) =>
                          o.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.utrNumber.includes(orderSearch) ||
                          o.id.toLowerCase().includes(orderSearch.toLowerCase())
                      )
                      .map((order) => (
                        <div
                          key={order.id}
                          className="rounded-2xl bg-[#0c0c14] border border-white/[0.08] p-5 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#8c7dff]">{order.id}</span>
                              <span className="text-xs text-zinc-500">•</span>
                              <span className="text-xs text-zinc-400 font-mono">
                                {new Date(order.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-emerald-400">
                                ₹{order.amount}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                CONFIRMED
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="text-zinc-500 block text-[10px] uppercase font-mono">Customer</span>
                              <span className="font-bold text-white">{order.fullName}</span>
                              {order.phone && <span className="text-zinc-400 block font-mono mt-0.5">📱 {order.phone}</span>}
                            </div>

                            <div>
                              <span className="text-zinc-500 block text-[10px] uppercase font-mono">Email Address</span>
                              <span className="text-zinc-200 font-mono break-all">{order.email}</span>
                              <div className="mt-1 flex items-center gap-1.5">
                                {order.emailSent ? (
                                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Email Dispatched
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-amber-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Email Pending
                                  </span>
                                )}
                                {order.emailPreviewUrl && (
                                  <a
                                    href={order.emailPreviewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-[#8c7dff] underline hover:text-white ml-2 flex items-center gap-1"
                                  >
                                    <span>Preview</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>

                            <div>
                              <span className="text-zinc-500 block text-[10px] uppercase font-mono">12-Digit UTR</span>
                              <span className="text-amber-300 font-mono font-bold">{order.utrNumber}</span>
                              <div className="mt-2">
                                <button
                                  onClick={() => handleResendEmail(order.id)}
                                  disabled={resendingId === order.id}
                                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-1"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>{resendingId === order.id ? 'Sending...' : 'Resend Email'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
