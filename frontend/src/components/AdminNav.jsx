import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList } from "lucide-react";

const tabs = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
];

const AdminNav = () => {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto border-b border-line pb-3">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              isActive ? "bg-ink text-white" : "text-muted hover:bg-slate-100"
            }`
          }
        >
          <Icon size={16} /> {label}
        </NavLink>
      ))}
    </div>
  );
};

export default AdminNav;