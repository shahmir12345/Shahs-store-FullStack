import { Link } from "react-router-dom";

//Login aur Signup se data yahan aaye ga aur put hoga

const AuthLayout = ({ title, subtitle, children, footer }) => {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Left brand panel (laptop only) */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-ink via-slate-900 to-slate-800 p-12 text-white lg:flex">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">
          My<span className="text-brand-500">Store</span>
        </Link>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight">
            Shop smarter, <span className="text-brand-500">live better.</span>
          </h2>
          <p className="mt-4 max-w-sm text-slate-300">
            Join thousands of happy customers and enjoy fast delivery on every order.
          </p>
        </div>
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} MyStore</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          {/* yeh login ka poora jsx hai include hai form bhi is main children = login_jsx */}
          <div className="mt-8">{children}</div> 
          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;