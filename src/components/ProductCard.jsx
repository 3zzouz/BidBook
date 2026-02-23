import { useCart } from "../lib/CartContext";

export default function ProductCard({ product }) {
  const { dispatch } = useCart();

  return (
    <div className="product-card" data-testid={`product-${product.id}`}>
      <div className="product-category">{product.category}</div>
      <h3 className="product-name">{product.name}</h3>
      <div className="product-meta">
        <span className="product-price">${product.price.toFixed(2)}</span>
        <span className="product-stock" data-testid={`stock-${product.id}`}>
          {product.stock} left
        </span>
      </div>
      <button
        className="add-btn"
        data-testid={`add-${product.id}`}
        onClick={() => dispatch({ type: "ADD_ITEM", item: product })}
      >
        Add to Cart
      </button>
    </div>
  );
}
