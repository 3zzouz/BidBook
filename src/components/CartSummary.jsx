import { useState } from "react";
import { useCart } from "../lib/CartContext";
import {
  calculateTotal,
  applyDiscount,
  isFreeShipping,
  applyBulkDiscounts,
} from "../lib/cart";

export default function CartSummary() {
  const { state, dispatch } = useCart();
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");

  const { items, discountCode } = state;

  const itemsWithBulk = applyBulkDiscounts(items);
  const effectiveItems = itemsWithBulk.map((i) => ({
    ...i,
    price: i.discountedPrice,
  }));

  const subtotal = items.length ? calculateTotal(items) : 0;
  const discounted = discountCode
    ? applyDiscount(subtotal, discountCode)
    : subtotal;
  const discount = parseFloat((subtotal - discounted).toFixed(2));
  const shipping = items.length ? (isFreeShipping(discounted) ? 0 : 5.99) : 0;
  const total = parseFloat((discounted + shipping).toFixed(2));

  function applyCode() {
    const validCodes = ["SAVE10", "SAVE20", "HALFOFF"];
    if (validCodes.includes(codeInput.toUpperCase())) {
      dispatch({ type: "SET_CODE", code: codeInput.toUpperCase() });
      setCodeError("");
    } else {
      setCodeError("Invalid discount code");
    }
  }

  return (
    <div className="cart-summary" data-testid="cart-summary">
      <h2 className="summary-title">Order Summary</h2>

      {items.length === 0 ? (
        <p className="empty-msg" data-testid="empty-cart">
          Your cart is empty.
        </p>
      ) : (
        <>
          <ul className="summary-items">
            {items.map((item) => (
              <li
                key={item.id}
                className="summary-item"
                data-testid={`cart-item-${item.id}`}
              >
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <div className="item-qty-controls">
                    <button
                      data-testid={`dec-${item.id}`}
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_QTY",
                          id: item.id,
                          qty: item.quantity - 1,
                        })
                      }
                    >
                      −
                    </button>
                    <span data-testid={`qty-${item.id}`}>{item.quantity}</span>
                    <button
                      data-testid={`inc-${item.id}`}
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_QTY",
                          id: item.id,
                          qty: item.quantity + 1,
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="item-right">
                  <span
                    className="item-total"
                    data-testid={`item-total-${item.id}`}
                  >
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    className="remove-btn"
                    data-testid={`remove-${item.id}`}
                    onClick={() =>
                      dispatch({ type: "REMOVE_ITEM", id: item.id })
                    }
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="discount-row">
            <input
              className="code-input"
              data-testid="code-input"
              placeholder="Discount code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
            />
            <button
              className="code-btn"
              data-testid="apply-code"
              onClick={applyCode}
            >
              Apply
            </button>
          </div>
          {codeError && (
            <p className="code-error" data-testid="code-error">
              {codeError}
            </p>
          )}
          {discountCode && (
            <p className="code-applied" data-testid="code-applied">
              Code <strong>{discountCode}</strong> applied!
            </p>
          )}

          <div className="totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span data-testid="subtotal">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="total-row discount">
                <span>Discount</span>
                <span data-testid="discount-amount">
                  −${discount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="total-row">
              <span>Shipping</span>
              <span data-testid="shipping">
                {shipping === 0 ? "🎉 Free" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span data-testid="total">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            className="checkout-btn"
            data-testid="checkout-btn"
            onClick={() => dispatch({ type: "CLEAR" })}
          >
            Place Order
          </button>
        </>
      )}
    </div>
  );
}
