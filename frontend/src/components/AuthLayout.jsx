import { Link } from "react-router-dom";

const Logo = ({ className = "" }) => (
  <img src="/logo.png" alt="Shah's Store" className={`object-contain ${className}`} />
);

const AuthLayout = ({ title, subtitle, children, footer, logoSide = "right" }) => {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Left brand panel (laptop only) */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-ink via-slate-900 to-slate-800 p-12 text-white lg:flex">
        {logoSide === "right" ? (
          <Link to="/" className="text-2xl font-extrabold tracking-tight">
            Shah's <span className="text-brand-500">Store</span>
          </Link>
        ) : (
          <div />
        )}

        <div className="flex flex-col justify-between items-center">
          <div className="flex justify-center items-center">
            {logoSide === "left" && <Logo className="mb-6 w-100" />}
          </div>
          <h2 className="text-4xl font-extrabold leading-tight">
            Shop smarter, <span className="text-brand-500">live better.</span>
          </h2>
          <p className="mt-4 max-w-md text-slate-300">
            Join thousands of happy customers and enjoy fast delivery on every order.
          </p>
        </div>

        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Shah's Store</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center items-center">
            <Logo
              className={`mb-6 w-60 ${logoSide === "left" ? "lg:hidden" : ""}`}
            />
          </div>
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;