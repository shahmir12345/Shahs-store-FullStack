import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(search);
  const [sort, setSort] = useState("newest");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  useEffect(() => {
    api.get("/products").then((res) => {
      setCategories([...new Set(res.data.map((p) => p.category))]);
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/products", {
          params: { search, category },
        });
        setProducts(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category]);

  const visibleProducts = useMemo(() => {
    let list = [...products];

    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, sort, maxPrice, inStockOnly]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam("search", searchInput.trim());
  };

  const clearAll = () => {
    setSearchParams({});
    setSearchInput("");
    setMaxPrice("");
    setInStockOnly(false);
    setSort("newest");
  };

  const hasFilters = search || category || maxPrice || inStockOnly;

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">Shop</h1>
        <p className="mt-1 text-muted">Find exactly what you are looking for</p>
      </div>

      {/* Search + sort bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="input !pl-10"
          />
        </form>

        <div className="flex gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input flex-1 sm:w-52 sm:flex-none"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="card space-y-6 p-5">
            <div>
              <p className="mb-3 text-sm font-bold">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam("category", "")}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    category === "" ? "bg-brand-50 font-semibold text-brand-600" : "hover:bg-slate-50"
                  }`}
                >
                  All categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateParam("category", c.toLowerCase() )}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm capitalize transition ${
                      category === c ? "bg-brand-50 font-semibold text-brand-600" : "hover:bg-slate-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-bold">Max price (Rs.)</p>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 5000"
                className="input"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              In stock only
            </label>

            {hasFilters && (
              <button onClick={clearAll} className="btn-outline w-full">
                <X size={16} /> Clear all
              </button>
            )}
          </div>
        </aside>

        {/* Results */}
        <div>
          {!loading && !error && (
            <p className="mb-4 text-sm text-muted">
              {visibleProducts.length} product{visibleProducts.length !== 1 && "s"} found
              {search && <> for "<span className="font-semibold text-ink">{search}</span>"</>}
            </p>
          )}

          {error && <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card animate-pulse overflow-hidden">
                  <div className="aspect-square bg-slate-200" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-4 w-1/3 rounded bg-slate-200" />
                  </div>
                </div>
              ))}

            {!loading &&
              visibleProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>

          {!loading && !error && visibleProducts.length === 0 && (
            <div className="card p-10 text-center">
              <p className="font-semibold">No products found</p>
              <p className="mt-1 text-sm text-muted">Try changing your search or filters.</p>
              {hasFilters && (
                <button onClick={clearAll} className="btn-primary mt-4">
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;