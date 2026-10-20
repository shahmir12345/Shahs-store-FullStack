import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, ImagePlus } from "lucide-react";
import api from "../../api/axios";
import AdminNav from "../../components/AdminNav";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  images: [],
};

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
  
    if (form.images.length + files.length > 5) {
      setError("Maximum 5 images per product");
      e.target.value = "";
      return;
    }
  
    const data = new FormData();
    files.forEach((f) => data.append("images", f));
  
    setUploading(true);
    setError("");
    try {
      const res = await api.post("/upload", data);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...res.data.urls], }));
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  
  const removeImage = (index) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };
  
  const makeMain = (index) => {
    const imgs = [...form.images];
    const [picked] = imgs.splice(index, 1);
    setForm({ ...form, images: [picked, ...imgs] });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const body = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      image: form.images ? form.images : [],
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, body);
      } else {
        await api.post("/products", body);
      }
      closeForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      stock: p.stock,
      images: p.image || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Products</h1>
          <p className="mt-1 text-muted">{products.length} products in your store</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={18} /> Add product
          </button>
        )}
      </div>

      <div className="mt-6">
        <AdminNav />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 grid gap-4 p-5 sm:grid-cols-2 sm:p-6 border-1 border-slate-400">
          <div className="flex items-center justify-between sm:col-span-2">
            <h2 className="text-lg font-bold">{editingId ? "Edit product" : "Add new product"}</h2>
            <button type="button" onClick={closeForm} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}

          <div>
            <label className="mb-1.5 block text-sm font-medium">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Category</label>
            <input name="category" value={form.category} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Price (Rs.)</label>
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Stock</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="input" required />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">
              Images <span className="text-muted">(up to 5, first one is the main image)</span>
            </label>

            <div className="flex flex-wrap gap-3">
              {form.images.map((img, i) => (
                <div key={img} className="relative h-24 w-24 overflow-hidden rounded-lg border border-line">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  {i === 0 ? (
                    <span className="absolute bottom-0 left-0 right-0 bg-brand-600 py-0.5 text-center text-[10px] font-bold text-white">
                      MAIN
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makeMain(i)}
                      className="absolute bottom-0 left-0 right-0 bg-ink/70 py-0.5 text-center text-[10px] font-bold text-white"
                    >
                      Make main
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 rounded-full bg-white p-0.5 shadow"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {form.images.length < 5 && (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line text-xs text-muted hover:border-brand-500 hover:text-brand-600">
                  <ImagePlus size={22} />
                  {uploading ? "Uploading..." : "Add"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handleFiles}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} className="input" required />
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : editingId ? "Update product" : "Add product"}
            </button>
            <button type="button" onClick={closeForm} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="card divide-y divide-line">
        {loading && <p className="p-5 text-muted">Loading...</p>}
        {!loading && products.length === 0 && <p className="p-5 text-muted">No products yet. Add your first one.</p>}

        {products.map((p) => (
          <div key={p._id} className="flex items-center gap-4 p-4 border border-slate-300">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {p.image?.[0] && <img src={p.image[0]} alt={p.name} className="h-full w-full object-cover" />}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{p.name}</p>
              <p className="text-sm capitalize text-muted">
                {p.category} · Rs. {p.price.toLocaleString()}
              </p>
            </div>

            <span
              className={`hidden rounded-full px-2.5 py-1 text-xs font-bold sm:inline ${
                p.stock === 0
                  ? "bg-red-50 text-red-600"
                  : p.stock <= 5
                  ? "bg-amber-50 text-amber-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {p.stock === 0 ? "Sold out" : `Stock: ${p.stock}`}
            </span>

            <div className="flex shrink-0 gap-1">
              <button onClick={() => handleEdit(p)} className="rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-ink" aria-label="Edit">
                <Pencil size={18} />
              </button>
              <button onClick={() => handleDelete(p._id)} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProducts;