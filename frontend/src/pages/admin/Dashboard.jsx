import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Clock, Wallet } from "lucide-react";
import api from "../../api/axios";
import AdminNav from "../../components/AdminNav";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  shipped: "bg-blue-50 text-blue-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, orders] = await Promise.all([
          api.get("/products"),
          api.get("/orders"),
        ]);
        setData({ products: products.data, orders: orders.data });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load stats");
      }
    };
    fetchStats();
  }, []);
  

  if (error) return <p className="container-page py-10 text-red-600">{error}</p>;

  if (!data) {
    return (
      <div className="container-page py-8">
        <div className="grid animate-pulse grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-28 bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const { products, orders } = data;
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const cards = [
    { label: "Products", value: products.length, icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Total orders", value: orders.length, icon: ShoppingCart, color: "bg-purple-50 text-purple-600" },
    { label: "Pending", value: orders.filter((o) => o.status === "pending").length, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Revenue", value: `Rs. ${revenue.toLocaleString()}`, icon: Wallet, color: "bg-green-50 text-green-600" },
  ];

  const lowStock = products.filter((p) => p.stock <= 5);

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-extrabold">Admin</h1>
      <p className="mb-6 mt-1 text-muted">Overview of your store</p>
      <AdminNav />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 border-1 border-slate-300">
            <div className={`inline-flex rounded-lg p-2.5 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="mt-3 text-sm text-muted">{label}</p>
            <p className="text-xl font-extrabold sm:text-2xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card p-5 border-1 border-slate-300">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-brand-600">
              View all
            </Link>
          </div>
          <div className="mt-4 divide-y divide-line">
            {orders.slice(0, 5).map((o) => (
              <div key={o._id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold">#{o._id.slice(-6).toUpperCase()}</p>
                  <p className="truncate text-muted">{o.user?.name || "Deleted user"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Rs. {o.totalPrice.toLocaleString()}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${statusStyles[o.status]}`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="py-3 text-sm text-muted">No orders yet.</p>}
          </div>
        </div>

        <div className="card h-fit p-5 border-1 border-slate-300">
          <h2 className="font-bold">Low stock</h2>
          <div className="mt-4 space-y-3">
            {lowStock.slice(0, 6).map((p) => (
              <div key={p._id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{p.name}</span>
                <span className={`shrink-0 font-bold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                  {p.stock === 0 ? "Sold out" : `${p.stock} left`}
                </span>
              </div>
            ))}
            {lowStock.length === 0 && <p className="text-sm text-muted">All products are well stocked.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;