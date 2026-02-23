import { useState, useEffect } from "react";
import { CartProvider, useCart } from "../lib/CartContext";
import ProductCard from "./ProductCard";
import CartSummary from "./CartSummary";
import {
  fetchMultipleProducts,
  sortItems,
  filterByCategory,
} from "../lib/cart";

const CATEGORY_OPTIONS = ["all", "electronics", "furniture", "kitchenware"];

function ShopLayout() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("price");
  const [category, setCategory] = useState("all");
  const { state } = useCart();
  const cartCount = state.items.reduce((n, i) => n + i.quantity, 0);

  useEffect(() => {
    fetchMultipleProducts([1, 2, 3, 4])
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const displayed = sortItems(
    category === "all" ? products : filterByCategory(products, category),
    sortField,
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            🛒 <span>ShopVite</span>
          </div>
          <div className="header-right">
            <span className="cart-badge" data-testid="cart-badge">
              {cartCount} item{cartCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="shop-section">
          <div className="controls">
            <div className="filter-group">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${category === cat ? "active" : ""}`}
                  data-testid={`filter-${cat}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <select
              className="sort-select"
              data-testid="sort-select"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="price">Sort: Price ↑</option>
              <option value="name">Sort: Name A–Z</option>
            </select>
          </div>

          {loading ? (
            <div className="loading" data-testid="loading">
              Loading products…
            </div>
          ) : (
            <div className="product-grid" data-testid="product-grid">
              {displayed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        <aside className="cart-section">
          <CartSummary />
        </aside>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <ShopLayout />
    </CartProvider>
  );
}
