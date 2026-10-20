import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  let soldOut = false
  product.stock === 0 ? (soldOut = true) : soldOut;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group card overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {product.image?.[0] ? (
          <img
            src={product.image[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No image
          </div>
        )}

        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur">
          {product.category}
        </span>

        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold">
              Sold out
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate font-semibold">{product.name}</h3>
        <p className="mt-1 text-lg font-extrabold text-brand-600">
          Rs. {product.price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;


// group aur group-hover:scale-105: card par mouse le jao to andar ki image halki si bari hoti hai. group parent par lagta hai, aur bachon par group-hover: us parent ke hover par chalta hai.
// hover:-translate-y-1 hover:shadow-xl: hover par card thora upar uthta hai aur saya gehra hota hai. transition se yeh smooth hota hai.
// aspect-square: image ka dabba hamesha barabar (square) rehta hai, chahe image kisi bhi size ki ho. Isse grid mein saare cards ek jaise lagte hain.
// absolute left-3 top-3: category ka badge image ke upar kone mein baith jata hai (parent relative hai).
// inset-0: top, right, bottom, left sab 0, yani poori image ko dhak leta hai. Sold out par gehri parat aur “Sold out” tag.
// toLocaleString(): 4500 ko 4,500 bana deta hai.
// card aur text-brand-600: wahi design system ki classes jo index.css mein banayi thin.