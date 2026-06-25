import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigate, Link } from "react-router-dom";
import { PageShell } from "@/components/site/PageShell";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  Trash2, 
  Edit3, 
  Plus, 
  X, 
  Check, 
  RefreshCw 
} from "lucide-react";
import { toast } from "sonner";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/services/productService";
import { getOrders, updateOrderStatus } from "@/services/orderService";
import { getAllUsers, updateUserStatus as adminUpdateUserStatus, deleteUser as adminDeleteUser } from "@/services/authService";

export default function AdminDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error("Access denied: Admins only");
      navigate("/");
    }
  }, [user, navigate]);

  // Tab State: 'overview' | 'orders' | 'products' | 'users'
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'users'>('overview');

  // Core Data States (Initialized empty)
  const [productsList, setProductsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch admin dashboard data on mount / user change
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchData = async () => {
      try {
        setLoadingData(true);
        const pRes = await getProducts({ limit: 100 });
        setProductsList(pRes.data.data.products);

        const oRes = await getOrders();
        setOrdersList(oRes.data.data.orders);

        const uRes = await getAllUsers();
        setUsersList(uRes.data.users);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  // Modal State for Add/Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formSalePrice, setFormSalePrice] = useState<number | "">("");
  const [formOnSale, setFormOnSale] = useState(false);
  const [formCategory, setFormCategory] = useState("bras");
  const [formColors, setFormColors] = useState("");
  const [formSizes, setFormSizes] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFabric, setFormFabric] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStock, setFormStock] = useState(10);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formBestSeller, setFormBestSeller] = useState(false);
  const [formNewArrival, setFormNewArrival] = useState(false);
  const [formSizeStock, setFormSizeStock] = useState<Record<string, number>>({});

  // Calculate Overview Stats
  const totalRevenue = ordersList
    .filter(o => o.paymentStatus === 'paid' || o.paymentMethod === 'cod')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrders = ordersList.length;
  const totalProducts = productsList.length;
  const totalUsers = usersList.length;

  // Open Modal to Add
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormSlug("");
    setFormPrice(1999);
    setFormSalePrice("");
    setFormOnSale(false);
    setFormCategory("bras");
    setFormColors("#9b6a72, #1a1a1a");
    setFormSizes("S, M, L");
    setFormSizeStock({ "S": 20, "M": 20, "L": 10 });
    setFormDescription("Premium lace lingerie designed for maximum comfort.");
    setFormFabric("90% Nylon, 10% Spandex");
    setFormImageUrl("https://images.unsplash.com/photo-1594913785162-e6785b423cb1?auto=format&fit=crop&q=80&w=600");
    setFormStock(50);
    setFormFeatured(false);
    setFormBestSeller(false);
    setFormNewArrival(true);
    setIsModalOpen(true);
  };

  // Open Modal to Edit
  const handleOpenEditModal = (product: any) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSlug(product.slug);
    setFormPrice(product.price);
    setFormSalePrice(product.salePrice || "");
    setFormOnSale(product.onSale || false);
    setFormCategory(product.category);
    setFormColors(product.colors.join(", "));
    setFormSizes(product.sizes.join(", "));
    setFormSizeStock(product.sizeStock || {});
    setFormDescription(product.description);
    setFormFabric(product.fabric);
    setFormImageUrl(product.images?.[0]?.url || "");
    setFormStock(product.stock || 20);
    setFormFeatured(product.featured || false);
    setFormBestSeller(product.bestSeller || false);
    setFormNewArrival(product.newArrival || false);
    setIsModalOpen(true);
  };

  // Delete Product
  const handleDeleteProduct = async (slug: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const target = productsList.find(p => p.slug === slug);
      if (!target) return;
      try {
        await deleteProduct(target._id);
        setProductsList(prev => prev.filter(p => p.slug !== slug));
        toast.success("Product deleted successfully");
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to delete product");
      }
    }
  };

  // Save Product (Add / Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formName || !formSlug) {
      toast.error("Name and Slug are required");
      return;
    }

    const colorArray = formColors.split(",").map(c => c.trim()).filter(Boolean);
    const sizeArray = formSizes.split(",").map(s => s.trim()).filter(Boolean);

    const sizeStockPayload: Record<string, number> = {};
    sizeArray.forEach(sz => {
      sizeStockPayload[sz] = Number(formSizeStock[sz]) || 0;
    });

    const calculatedStock = sizeArray.reduce((sum, sz) => sum + (sizeStockPayload[sz] || 0), 0);

    const productPayload = {
      name: formName,
      slug: formSlug,
      price: Number(formPrice),
      discountPrice: formOnSale && formSalePrice !== "" ? Number(formSalePrice) : null,
      salePrice: formOnSale && formSalePrice !== "" ? Number(formSalePrice) : null,
      category: formCategory,
      onSale: formOnSale,
      colors: colorArray,
      sizes: sizeArray,
      sizeStock: sizeStockPayload,
      description: formDescription,
      fabric: formFabric,
      images: [{ url: formImageUrl, publicId: "" }],
      stock: calculatedStock,
      bestSeller: formBestSeller,
      featured: formFeatured,
      newArrival: formNewArrival,
      bg: editingProduct ? editingProduct.bg : "from-[#b88a8f] to-[#8a5a62]"
    };

    try {
      if (editingProduct) {
        // Edit mode
        const res = await updateProduct(editingProduct._id, productPayload);
        if (res.data.success) {
          setProductsList(prev => prev.map(p => p._id === editingProduct._id ? res.data.product : p));
          toast.success("Product updated successfully");
        }
      } else {
        // Add mode
        if (productsList.some(p => p.slug === formSlug)) {
          toast.error("A product with this slug already exists");
          return;
        }
        const res = await createProduct(productPayload);
        if (res.data.success) {
          setProductsList(prev => [res.data.product, ...prev]);
          toast.success("Product added successfully");
        }
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  };

  // Update Order Status
  const handleOrderFieldChange = async (orderId: string, field: 'orderStatus' | 'paymentStatus', value: string) => {
    try {
      const status = field === 'orderStatus' ? value : undefined;
      const paymentStatus = field === 'paymentStatus' ? value : undefined;
      const res = await updateOrderStatus(orderId, status as any, paymentStatus);
      if (res.data.success) {
        setOrdersList(prev => prev.map(o => {
          if (o._id === orderId) {
            return { ...o, [field]: value };
          }
          return o;
        }));
        toast.success(`Order ${field === 'orderStatus' ? 'Status' : 'Payment'} updated`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update order status");
    }
  };

  // Toggle user suspension status
  const handleUserStatusToggle = async (userId: string, currentStatus: 'active' | 'suspended') => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const actionWord = newStatus === 'suspended' ? 'suspend' : 'activate';
    
    if (window.confirm(`Are you sure you want to ${actionWord} this user?`)) {
      try {
        const res = await adminUpdateUserStatus(userId, newStatus);
        if (res.data.success) {
          setUsersList(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
          toast.success(`User successfully ${newStatus}`);
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.error || `Failed to ${actionWord} user`);
      }
    }
  };

  // Delete user account
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this user account? This action is irreversible.")) {
      try {
        const res = await adminDeleteUser(userId);
        if (res.data.success) {
          setUsersList(prev => prev.filter(u => u._id !== userId));
          toast.success("User permanently deleted");
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.error || "Failed to delete user");
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <PageShell>
      <Helmet><title>Admin Control Panel</title></Helmet>
      
      <section className="bg-secondary border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-primary">ADMIN CONTROL PANEL</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage products, verify client orders, and view sales statistics.</p>
          </div>
          <Link to="/profile" className="text-xs uppercase tracking-wider underline text-muted-foreground hover:text-primary">Back to Profile</Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-60 shrink-0">
          <nav className="flex lg:flex-col gap-1 border-b lg:border-b-0 lg:border-r border-border pb-4 lg:pb-0 lg:pr-4">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide uppercase transition rounded-sm w-full text-left ${activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-primary'}`}
            >
              <LayoutDashboard className="h-4 w-4" /> Overview
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide uppercase transition rounded-sm w-full text-left ${activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-primary'}`}
            >
              <ShoppingBag className="h-4 w-4" /> Orders ({ordersList.length})
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide uppercase transition rounded-sm w-full text-left ${activeTab === 'products' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-primary'}`}
            >
              <Package className="h-4 w-4" /> Products ({productsList.length})
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide uppercase transition rounded-sm w-full text-left ${activeTab === 'users' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-primary'}`}
            >
              <Users className="h-4 w-4" /> Users ({usersList.length})
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Revenue", val: `PKR ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10" },
                  { label: "Total Orders", val: totalOrders, icon: ShoppingBag, color: "text-indigo-500 bg-indigo-500/10" },
                  { label: "Active Products", val: totalProducts, icon: Package, color: "text-rose-500 bg-rose-500/10" },
                  { label: "Active Users", val: totalUsers, icon: Users, color: "text-amber-500 bg-amber-500/10" },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-secondary/20 border border-border p-6 rounded-sm flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                        <div className="text-xl md:text-2xl font-serif text-primary mt-2">{stat.val}</div>
                      </div>
                      <div className={`p-3 rounded-full ${stat.color}`}><Icon className="h-5 w-5" /></div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-secondary/10 border border-border p-6 rounded-sm">
                <h3 className="font-serif text-lg text-primary mb-4">Store Activity Status</h3>
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div className="p-4 bg-background border border-border rounded-sm">
                    <span className="text-xs uppercase text-muted-foreground">API Server Connection</span>
                    <div className="flex items-center gap-2 mt-2 font-medium text-emerald-600"><Check className="h-4 w-4" /> Operational</div>
                  </div>
                  <div className="p-4 bg-background border border-border rounded-sm">
                    <span className="text-xs uppercase text-muted-foreground">Resend Email Gateway</span>
                    <div className="flex items-center gap-2 mt-2 font-medium text-emerald-600"><Check className="h-4 w-4" /> Gateway Mock Active</div>
                  </div>
                  <div className="p-4 bg-background border border-border rounded-sm">
                    <span className="text-xs uppercase text-muted-foreground">Stripe Sandbox Payments</span>
                    <div className="flex items-center gap-2 mt-2 font-medium text-emerald-600"><Check className="h-4 w-4" /> Sandbox Mode Enabled</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-secondary/10 border border-border rounded-sm overflow-hidden animate-in fade-in duration-200">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="font-serif text-xl text-primary">Manage Customer Orders</h2>
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider font-medium">{ordersList.length} Total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-secondary/20 text-muted-foreground uppercase text-[10px] tracking-widest border-b border-border">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer Address</th>
                      <th className="p-4">Items Summary</th>
                      <th className="p-4">Grand Total</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ordersList.map((order) => (
                      <tr key={order._id} className="hover:bg-secondary/5">
                        <td className="p-4 font-mono text-xs text-primary">{order._id}</td>
                        <td className="p-4">
                          <div className="font-medium">{order.shippingAddress.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{order.shippingAddress.city}</div>
                          <div className="text-[10px] text-muted-foreground">{order.shippingAddress.phone}</div>
                        </td>
                        <td className="p-4">
                          {order.items.map((it: any, idx: number) => (
                            <div key={idx} className="text-xs">
                              {it.title} ({it.color}, {it.size}) <span className="text-muted-foreground">x{it.quantity}</span>
                            </div>
                          ))}
                        </td>
                        <td className="p-4 font-medium text-primary">PKR {order.total.toLocaleString()}</td>
                        <td className="p-4">
                          <select 
                            value={order.paymentStatus} 
                            onChange={(e) => handleOrderFieldChange(order._id, 'paymentStatus', e.target.value)}
                            className="bg-background border border-border rounded-sm text-xs p-1 outline-none focus:border-primary"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                          </select>
                          <div className="text-[10px] text-muted-foreground uppercase mt-1 tracking-wider">{order.paymentMethod}</div>
                        </td>
                        <td className="p-4">
                          <select 
                            value={order.orderStatus} 
                            onChange={(e) => handleOrderFieldChange(order._id, 'orderStatus', e.target.value)}
                            className={`border rounded-sm text-xs p-1 outline-none font-medium ${
                              order.orderStatus === 'delivered' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                              order.orderStatus === 'cancelled' ? 'border-rose-200 text-rose-700 bg-rose-50' :
                              'border-amber-200 text-amber-700 bg-amber-50'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center bg-secondary/10 border border-border p-4 rounded-sm">
                <div>
                  <h2 className="font-serif text-lg text-primary">Product Inventory</h2>
                  <p className="text-xs text-muted-foreground">Add new releases or update existing sizes, colors, and stock.</p>
                </div>
                <button 
                  onClick={handleOpenAddModal}
                  className="bg-primary text-primary-foreground text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-primary/95 flex items-center gap-2 font-medium"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Product
                </button>
              </div>

              <div className="bg-secondary/10 border border-border rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-secondary/20 text-muted-foreground uppercase text-[10px] tracking-widest border-b border-border">
                        <th className="p-4">Product Info</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Badges</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {productsList.map((product) => (
                        <tr key={product.slug} className="hover:bg-secondary/5">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-8 bg-gradient-to-br ${product.bg} rounded-sm flex items-center justify-center font-serif text-[8px] text-primary-foreground/75 shrink-0`}>✦</div>
                              <div>
                                <div className="font-medium text-primary">{product.name}</div>
                                <div className="text-[10px] font-mono text-muted-foreground">{product.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 capitalize text-xs">{product.category}</td>
                          <td className="p-4 text-xs font-semibold">
                            {product.onSale && product.salePrice ? (
                              <div>
                                <div className="text-rose">PKR {product.salePrice.toLocaleString()}</div>
                                <div className="line-through text-muted-foreground opacity-60 text-[10px]">PKR {product.price.toLocaleString()}</div>
                              </div>
                            ) : (
                              <>PKR {product.price.toLocaleString()}</>
                            )}
                          </td>
                          <td className="p-4 text-xs">
                            <span className={`font-medium ${product.stock <= 10 ? 'text-rose font-semibold' : ''}`}>{product.stock || 0}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {product.featured && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">Feat</span>}
                              {product.bestSeller && <span className="text-[9px] bg-indigo-500/10 text-indigo-700 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">Best</span>}
                              {product.newArrival && <span className="text-[9px] bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">New</span>}
                              {product.onSale && <span className="text-[9px] bg-rose-500/10 text-rose-700 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">Sale</span>}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleOpenEditModal(product)}
                                className="p-2 border border-border hover:border-primary rounded-sm hover:text-primary transition" 
                                aria-label="Edit"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.slug)}
                                className="p-2 border border-border hover:border-rose rounded-sm hover:text-rose transition" 
                                aria-label="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MANAGE USERS */}
          {activeTab === 'users' && (
            <div className="bg-secondary/10 border border-border rounded-sm overflow-hidden animate-in fade-in duration-200">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-xl text-primary">Manage Registered Users</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Suspend, reactivate, or remove customer accounts from platform access.</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider font-medium">{usersList.length} Total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-secondary/20 text-muted-foreground uppercase text-[10px] tracking-widest border-b border-border">
                      <th className="p-4">User Details</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date Joined</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {usersList.map((usr) => (
                      <tr key={usr._id} className="hover:bg-secondary/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-serif flex items-center justify-center font-bold text-sm shrink-0">
                              {usr.name ? usr.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-primary flex items-center gap-1.5">
                                {usr.name || 'Unnamed User'}
                                {usr._id === user?._id && (
                                  <span className="text-[8px] bg-indigo-500/20 text-indigo-700 px-1 py-0.5 rounded uppercase tracking-wider font-semibold">You</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">{usr.email}</div>
                              {usr.phone && <div className="text-[10px] text-muted-foreground">{usr.phone}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 capitalize text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${usr.role === 'admin' ? 'bg-indigo-500/10 text-indigo-700' : 'bg-secondary text-muted-foreground border border-border'}`}>
                            {usr.role || 'customer'}
                          </span>
                        </td>
                        <td className="p-4 text-xs">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase ${
                            usr.status === 'suspended' ? 'bg-rose-500/10 text-rose-700' : 'bg-emerald-500/10 text-emerald-700'
                          }`}>
                            {usr.status === 'suspended' ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {usr._id !== user?._id && (
                              <>
                                <button 
                                  onClick={() => handleUserStatusToggle(usr._id, usr.status)}
                                  className={`px-3 py-1.5 border rounded-sm text-xs font-semibold uppercase tracking-wider transition ${
                                    usr.status === 'suspended' 
                                      ? 'border-emerald-300 hover:bg-emerald-50 text-emerald-700 bg-emerald-50/50' 
                                      : 'border-rose-300 hover:bg-rose-50 text-rose-700 bg-rose-50/50'
                                  }`} 
                                >
                                  {usr.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(usr._id)}
                                  className="p-2 border border-border hover:border-rose rounded-sm hover:text-rose transition" 
                                  aria-label="Delete User"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ADD / EDIT PRODUCT MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-background border border-border w-full max-w-2xl rounded-sm shadow-xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/10">
              <h3 className="font-serif text-xl text-primary">{editingProduct ? "Edit Product Details" : "Add New Product Releases"}</h3>
              <button onClick={() => setIsModalOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-primary"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Product Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)} 
                    placeholder="e.g. Silk Lace Bodysuit" 
                    className="w-full border border-border p-2.5 rounded-sm bg-background text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">URL Slug</label>
                  <input 
                    type="text" 
                    required 
                    value={formSlug} 
                    onChange={(e) => setFormSlug(e.target.value)} 
                    placeholder="e.g. silk-lace-bodysuit" 
                    className="w-full border border-border p-2.5 rounded-sm bg-background text-sm font-mono outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Category</label>
                  <select 
                    value={formCategory} 
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full border border-border p-2.5 rounded-sm bg-background text-sm outline-none focus:border-primary"
                  >
                    <option value="bras">Bras</option>
                    <option value="panties">Panties</option>
                    <option value="sets">Matching Sets</option>
                    <option value="shapewear">Shapewear</option>
                    <option value="sleepwear">Sleepwear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Regular Price (PKR)</label>
                  <input 
                    type="number" 
                    required 
                    value={formPrice} 
                    onChange={(e) => setFormPrice(Number(e.target.value))} 
                    className="w-full border border-border p-2.5 rounded-sm bg-background text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Total Stock (Calculated)</label>
                  <input 
                    type="number" 
                    disabled
                    value={formSizes.split(",").map(s => s.trim()).filter(Boolean).reduce((sum, sz) => sum + (formSizeStock[sz] || 0), 0)} 
                    className="w-full border border-border p-2.5 rounded-sm bg-secondary/50 text-sm outline-none cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="bg-secondary/20 p-4 border border-border rounded-sm space-y-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="formOnSale" 
                    checked={formOnSale} 
                    onChange={(e) => setFormOnSale(e.target.checked)} 
                    className="h-4 w-4 border-border rounded bg-background accent-primary" 
                  />
                  <label htmlFor="formOnSale" className="text-xs uppercase tracking-wider font-semibold text-primary select-none cursor-pointer">Enable Promotional Sale Price</label>
                </div>
                {formOnSale && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Sale Price (PKR)</label>
                    <input 
                      type="number" 
                      required 
                      value={formSalePrice} 
                      onChange={(e) => setFormSalePrice(e.target.value === "" ? "" : Number(e.target.value))} 
                      placeholder="e.g. 1499" 
                      className="w-full border border-border p-2.5 rounded-sm bg-background text-sm outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Product Images Link</label>
                <input 
                  type="url" 
                  value={formImageUrl} 
                  onChange={(e) => setFormImageUrl(e.target.value)} 
                  placeholder="https://images.unsplash.com/photo-..." 
                  className="w-full border border-border p-2.5 rounded-sm bg-background text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Available Colors (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={formColors} 
                    onChange={(e) => setFormColors(e.target.value)} 
                    placeholder="#9b6a72, #1a1a1a" 
                    className="w-full border border-border p-2.5 rounded-sm bg-background text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Available Sizes (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={formSizes} 
                    onChange={(e) => setFormSizes(e.target.value)} 
                    placeholder="S, M, L, XL" 
                    className="w-full border border-border p-2.5 rounded-sm bg-background text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Dynamic Size-Specific Stock Inputs */}
              {formSizes.split(",").map(s => s.trim()).filter(Boolean).length > 0 && (
                <div className="bg-secondary/15 border border-border p-4 rounded-sm animate-in fade-in duration-200">
                  <h4 className="text-xs uppercase tracking-wider text-primary font-semibold mb-3">Manage Separate Stock per Size</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {formSizes.split(",").map(s => s.trim()).filter(Boolean).map(sz => (
                      <div key={sz} className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Size {sz} Stock</label>
                        <input
                          type="number"
                          min="0"
                          value={formSizeStock[sz] !== undefined ? formSizeStock[sz] : 0}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                            setFormSizeStock(prev => ({ ...prev, [sz]: val }));
                          }}
                          className="w-full border border-border p-2 rounded-sm bg-background text-xs outline-none focus:border-primary font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Fabric Blend details</label>
                  <input 
                    type="text" 
                    value={formFabric} 
                    onChange={(e) => setFormFabric(e.target.value)} 
                    placeholder="90% Satin Modal, 10% Spandex Scallop" 
                    className="w-full border border-border p-2.5 rounded-sm bg-background text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-6 pt-6">
                  {[
                    { id: "feat", label: "Featured", state: formFeatured, set: setFormFeatured },
                    { id: "best", label: "Bestseller", state: formBestSeller, set: setFormBestSeller },
                    { id: "new", label: "New Arrival", state: formNewArrival, set: setFormNewArrival }
                  ].map(flag => (
                    <div key={flag.id} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={flag.id} 
                        checked={flag.state} 
                        onChange={(e) => flag.set(e.target.checked)} 
                        className="h-4 w-4 border-border rounded bg-background accent-primary" 
                      />
                      <label htmlFor={flag.id} className="text-xs uppercase tracking-wider text-muted-foreground select-none cursor-pointer font-medium">{flag.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">Product Description</label>
                <textarea 
                  value={formDescription} 
                  onChange={(e) => setFormDescription(e.target.value)} 
                  rows={4} 
                  className="w-full border border-border p-2.5 rounded-sm bg-background text-sm outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-border text-xs uppercase tracking-widest hover:bg-secondary/30 rounded-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-primary/95 rounded-sm font-medium"
                >
                  {editingProduct ? "Save Changes" : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PageShell>
  );
}
