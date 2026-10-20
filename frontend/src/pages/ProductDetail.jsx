import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      setQuantity(1);
      setActiveImage(0);
      setAdded(false);

      // yahan jo seleted id hai wo aa rahi hai but jab hammay category milli tu neechay hum usi category ki basis par related products bhi nikaal rahein hain jo user ko neechay alag se show ho same category ke 
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);

        const { data: sameCategory } = await api.get("/products", {
          params: { category: data.category },
        });
        //means jo user ne click kiya hu hai already us ko hata kar remaining show hon gen
        setRelated(sameCategory.filter((p) => p._id !== data._id).slice(0, 4));
      } catch (err) {
        setProduct(null);
        setError(err.response?.data?.message || "Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0 });
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");

    setError("");
    setAdding(true);
    try {
      await addToCart(id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page grid animate-pulse gap-10 py-10 md:grid-cols-2">
        <div className="aspect-square rounded-2xl bg-slate-200" />
        <div className="space-y-4">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-8 w-3/4 rounded bg-slate-200" />
          <div className="h-8 w-1/3 rounded bg-slate-200" />
          <div className="h-24 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-lg font-semibold">{error || "Product not found"}</p>
        <Link to="/products" className="btn-primary mt-4">
          Back to shop
        </Link>
      </div>
    );
  }

  const soldOut = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="container-page py-8">
      <Link
        to="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink"
      >
        <ChevronLeft size={16} /> Back to shop
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border border-line bg-slate-100">
            {product.image?.[activeImage] ? (
              <img
                src={product.image[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                No image
              </div>
            )}
          </div>

          {product.image?.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {product.image.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? "border-brand-600" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button> 
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold capitalize text-brand-600">
            {product.category}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight">{product.name}</h1>
          <p className="mt-3 text-3xl font-extrabold text-brand-600">
            Rs. {product.price.toLocaleString()}
          </p>

          <div className="mt-4">
            {soldOut ? (
              <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
                Out of stock
              </span>
            ) : lowStock ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
                Only {product.stock} left
              </span>
            ) : (
              <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-600">
                In stock
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-slate-600">{product.description}</p>

          {/* //kabhie 1 se neechay and product.stock se upper nhi ja sakay ga */}
          {!soldOut && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center rounded-lg border border-line bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-slate-50"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-3 hover:bg-slate-50"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary flex-1 !py-3 sm:flex-none sm:!px-10"
              >
                {added ? (
                  <>
                    <Check size={18} /> Added
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> {adding ? "Adding..." : "Add to cart"}
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;