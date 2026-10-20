import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Truck, ShieldCheck, RotateCcw, Headphones, ArrowRight } from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const perks = [
  { icon: Truck, title: "Fast Delivery", text: "Delivered to your doorstep" },
  { icon: ShieldCheck, title: "Secure Shopping", text: "Safe and reliable" },
  { icon: RotateCcw, title: "Easy Returns", text: "Hassle-free returns" },
  { icon: Headphones, title: "24/7 Support", text: "We're always here to help" },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 8);

  //1st itertaion "men" find : acc[p.category] -> acc["men"] || 0 -> check-> acc {empty} -> 0 + 1 = 1 => acc {"men" : 1}
  //2nd itertaion again "men" find : acc[p.category] -> acc["men"] || 0 -> check-> acc {"men" : 1} -> 1 + 1 = 2 => acc {"men" : 2}

  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  //taking only first four categories
  const categories = Object.entries(categoryCounts).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-ink via-slate-900 to-slate-800 text-white">
        <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-brand-600/20 px-3 py-1 text-xs font-semibold text-brand-500">
              New Collection 2026
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Your favorite products,{" "}
              <span className="text-brand-500">at the best prices</span>
            </h1>
            <p className="mt-4 max-w-md text-slate-300">
              Curated products, transparent pricing, and fast delivery. A
              simpler and better way to shop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary !px-7 !py-3">
                Shop Now <ArrowRight size={18} />
              </Link>
              <a
                href="#featured"
                className="btn !border !border-slate-600 !px-7 !py-3 text-white hover:bg-slate-800"
              >
                Explore Featured
              </a>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -right-6 -top-6 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((p, i) => (
                <div
                  key={p._id}
                  className={`aspect-square overflow-hidden rounded-2xl bg-slate-700 ${
                    i % 2 === 1 ? "mt-8" : ""
                  }`}
                >
                  {p.images?.[0] && (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="border-b border-line bg-white">
        <div className="container-page grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="rounded-lg bg-brand-50 p-2.5 text-brand-600">
                <Icon size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-page pt-14">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Categories</h2>
          <p className="mt-1 text-muted">Explore your favorite categories</p>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(([name, count]) => (
              <Link
                key={name}
                to={`/products?category=${name}`}
                className="group card bg-slate-100 p-6 transition hover:border-brand-500 hover:shadow-lg"
              >
                <p className="text-lg font-bold capitalize">{name}</p>
                <p className="mt-1 text-sm text-muted">{count} products</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  Explore
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section id="featured" className="container-page pt-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Featured Products
            </h2>
            <p className="mt-1 text-muted">The latest and most popular</p>
          </div>
          <Link
            to="/products"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-600 sm:inline-flex"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card animate-pulse overflow-hidden">
                <div className="aspect-square bg-slate-200" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                </div>
              </div>
            ))}

          {!loading &&
            featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>

        {!loading && featured.length === 0 && (
          <p className="text-muted">No products available yet.</p>
        )}
      </section>

      {/* CTA */}
      <section className="container-page pt-14">
        <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Create an account and start shopping
          </h2>
          <p className="mx-auto mt-2 max-w-md text-brand-50">
            Sign up in just a minute and start your first shopping experience.
          </p>
          <Link
            to="/signup"
            className="btn mt-6 bg-white !px-7 !py-3 text-brand-700 hover:bg-brand-50"
          >
            Sign Up
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;



// Explanation:
// perks ek array hai jisme icon ka component hi rakha hai. .map(({ icon: Icon, ... })) mein icon: Icon naam badalta hai, kyunke JSX mein component ka naam bare harf se shuru hona zaroori hai (<Icon />). Naya perk ek line se add hota hai.
// bg-gradient-to-br from-ink via-slate-900 to-slate-800: ek rang se doosre mein dheere dheere badalta background. br yani bottom-right ki taraf.
// text-4xl sm:text-5xl lg:text-6xl: heading mobile par chhoti, bari screen par bari (responsive text).
// Hero ke dayen taraf aapke asli products ki images ka collage hai (featured.slice(0, 4)). i % 2 === 1 ? "mt-8": har doosri image neeche ho jati hai, jis se zig-zag look aata hai. hidden md:block se yeh mobile par chhup jata hai. Images na hon to sirf gehre dabbe nazar aayenge, isliye apne products mein image URLs daal do.
// blur-3xl wala gol dabba orange roshni ka asar deta hai.
// reduce se { shoes: 3, shirts: 2 } jaisa object banta hai (category kitni dafa aayi). Object.entries usay [["shoes", 3], ...] array banata hai, aur .slice(0, 4) pehli 4 leta hai. Alag categories ka API route banane ki zaroorat nahi parhi.
// Category card /products?category=shoes par jata hai. Is ke liye neeche Products.jsx mein ek chhoti tabdeeli chahiye.
// href="#featured" aur section par id="featured": button dabane par page khud neeche Featured section tak scroll karta hai.
// Skeleton loading: data aane tak gray pulse karte dabbe dikhte hain (animate-pulse), sirf “Loading...” likhne se kahin behtar lagta hai. Array.from({ length: 4 }) 4 khali items ka array banata hai jis par map chalta hai.
// group-hover:translate-x-1: card par hover karo to teer aage sarakta hai.
// Grid grid-cols-2 lg:grid-cols-4: mobile par bhi 2 columns, jo e-commerce mein aam hai (zyada products ek nazar mein).