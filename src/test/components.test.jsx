import { describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "../lib/CartContext";
import ProductCard from "../components/ProductCard";
import CartSummary from "../components/CartSummary";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Wraps children in CartProvider for isolated component tests */
function renderWithCart(ui) {
  return render(<CartProvider>{ui}</CartProvider>);
}

const mockProduct = {
  id: 1,
  name: "Laptop",
  price: 999.99,
  category: "electronics",
  stock: 5,
};

const cheapProduct = {
  id: 4,
  name: "Coffee Mug",
  price: 12.99,
  category: "kitchenware",
  stock: 50,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. CartContext
// ─────────────────────────────────────────────────────────────────────────────
describe("CartContext", () => {
  it("throws when useCart is used outside CartProvider", () => {
    // suppress React's error boundary console.error for this test
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const BadComponent = () => {
      useCart();
      return null;
    };
    expect(() => render(<BadComponent />)).toThrow(
      "useCart must be used inside CartProvider",
    );
    spy.mockRestore();
  });

  it("provides an initial empty cart state", () => {
    let capturedState;
    function Probe() {
      const { state } = useCart();
      capturedState = state;
      return null;
    }
    renderWithCart(<Probe />);
    expect(capturedState.items).toEqual([]);
    expect(capturedState.discountCode).toBe("");
  });

  it("ADD_ITEM adds a new item with quantity 1", () => {
    let captured;
    function Probe() {
      const { state, dispatch } = useCart();
      captured = state;
      return (
        <button
          onClick={() => dispatch({ type: "ADD_ITEM", item: mockProduct })}
        >
          add
        </button>
      );
    }
    renderWithCart(<Probe />);
    fireEvent.click(screen.getByText("add"));
    expect(captured.items).toHaveLength(1);
    expect(captured.items[0].quantity).toBe(1);
    expect(captured.items[0].name).toBe("Laptop");
  });

  it("ADD_ITEM increments quantity when item already exists", () => {
    let captured;
    function Probe() {
      const { state, dispatch } = useCart();
      captured = state;
      return (
        <button
          onClick={() => dispatch({ type: "ADD_ITEM", item: mockProduct })}
        >
          add
        </button>
      );
    }
    renderWithCart(<Probe />);
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("add"));
    expect(captured.items).toHaveLength(1);
    expect(captured.items[0].quantity).toBe(2);
  });

  it("REMOVE_ITEM removes the correct item", () => {
    let captured;
    function Probe() {
      const { state, dispatch } = useCart();
      captured = state;
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: mockProduct })}
          >
            add
          </button>
          <button
            onClick={() =>
              dispatch({ type: "REMOVE_ITEM", id: mockProduct.id })
            }
          >
            remove
          </button>
        </>
      );
    }
    renderWithCart(<Probe />);
    fireEvent.click(screen.getByText("add"));
    expect(captured.items).toHaveLength(1);
    fireEvent.click(screen.getByText("remove"));
    expect(captured.items).toHaveLength(0);
  });

  it("UPDATE_QTY changes quantity of the correct item", () => {
    let captured;
    function Probe() {
      const { state, dispatch } = useCart();
      captured = state;
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: mockProduct })}
          >
            add
          </button>
          <button
            onClick={() =>
              dispatch({ type: "UPDATE_QTY", id: mockProduct.id, qty: 7 })
            }
          >
            setQty
          </button>
        </>
      );
    }
    renderWithCart(<Probe />);
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("setQty"));
    expect(captured.items[0].quantity).toBe(7);
  });

  it("UPDATE_QTY clamps quantity to minimum 1", () => {
    let captured;
    function Probe() {
      const { state, dispatch } = useCart();
      captured = state;
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: mockProduct })}
          >
            add
          </button>
          <button
            onClick={() =>
              dispatch({ type: "UPDATE_QTY", id: mockProduct.id, qty: -5 })
            }
          >
            setNeg
          </button>
        </>
      );
    }
    renderWithCart(<Probe />);
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("setNeg"));
    expect(captured.items[0].quantity).toBe(1);
  });

  it("SET_CODE stores the discount code", () => {
    let captured;
    function Probe() {
      const { state, dispatch } = useCart();
      captured = state;
      return (
        <button onClick={() => dispatch({ type: "SET_CODE", code: "HALFOFF" })}>
          setCode
        </button>
      );
    }
    renderWithCart(<Probe />);
    fireEvent.click(screen.getByText("setCode"));
    expect(captured.discountCode).toBe("HALFOFF");
  });

  it("CLEAR resets items and discount code", () => {
    let captured;
    function Probe() {
      const { state, dispatch } = useCart();
      captured = state;
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: mockProduct })}
          >
            add
          </button>
          <button
            onClick={() => dispatch({ type: "SET_CODE", code: "SAVE10" })}
          >
            setCode
          </button>
          <button onClick={() => dispatch({ type: "CLEAR" })}>clear</button>
        </>
      );
    }
    renderWithCart(<Probe />);
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("setCode"));
    fireEvent.click(screen.getByText("clear"));
    expect(captured.items).toEqual([]);
    expect(captured.discountCode).toBe("");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. ProductCard
// ─────────────────────────────────────────────────────────────────────────────
describe("<ProductCard />", () => {
  it("renders product name, price, category, and stock", () => {
    renderWithCart(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText("$999.99")).toBeInTheDocument();
    expect(screen.getByText("electronics")).toBeInTheDocument();
    expect(screen.getByTestId("stock-1")).toHaveTextContent("5 left");
  });

  it('renders an "Add to Cart" button', () => {
    renderWithCart(<ProductCard product={mockProduct} />);
    expect(screen.getByTestId("add-1")).toBeInTheDocument();
  });

  it('dispatches ADD_ITEM when "Add to Cart" is clicked', () => {
    let captured;
    function Probe() {
      const { state } = useCart();
      captured = state;
      return <ProductCard product={mockProduct} />;
    }
    renderWithCart(<Probe />);
    fireEvent.click(screen.getByTestId("add-1"));
    expect(captured.items).toHaveLength(1);
    expect(captured.items[0].id).toBe(1);
  });

  it('clicking "Add to Cart" twice increments quantity', () => {
    let captured;
    function Probe() {
      const { state } = useCart();
      captured = state;
      return <ProductCard product={mockProduct} />;
    }
    renderWithCart(<Probe />);
    fireEvent.click(screen.getByTestId("add-1"));
    fireEvent.click(screen.getByTestId("add-1"));
    expect(captured.items[0].quantity).toBe(2);
  });

  it("multiple different products add independently", () => {
    let captured;
    function Probe() {
      const { state } = useCart();
      captured = state;
      return (
        <>
          <ProductCard product={mockProduct} />
          <ProductCard product={cheapProduct} />
        </>
      );
    }
    renderWithCart(<Probe />);
    fireEvent.click(screen.getByTestId("add-1"));
    fireEvent.click(screen.getByTestId("add-4"));
    expect(captured.items).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CartSummary
// ─────────────────────────────────────────────────────────────────────────────
describe("<CartSummary />", () => {
  it("shows empty message when cart is empty", () => {
    renderWithCart(<CartSummary />);
    expect(screen.getByTestId("empty-cart")).toBeInTheDocument();
  });

  it("shows items after adding a product", () => {
    function Setup() {
      const { dispatch } = useCart();
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: cheapProduct })}
          >
            add
          </button>
          <CartSummary />
        </>
      );
    }
    renderWithCart(<Setup />);
    fireEvent.click(screen.getByText("add"));
    expect(
      screen.getByTestId(`cart-item-${cheapProduct.id}`),
    ).toBeInTheDocument();
    expect(screen.getByText("Coffee Mug")).toBeInTheDocument();
  });

  it("displays the correct subtotal", () => {
    function Setup() {
      const { dispatch } = useCart();
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: cheapProduct })}
          >
            add
          </button>
          <CartSummary />
        </>
      );
    }
    renderWithCart(<Setup />);
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("subtotal")).toHaveTextContent("$12.99");
  });

  it("shows paid shipping when subtotal < $50", () => {
    function Setup() {
      const { dispatch } = useCart();
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: cheapProduct })}
          >
            add
          </button>
          <CartSummary />
        </>
      );
    }
    renderWithCart(<Setup />);
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("shipping")).toHaveTextContent("$5.99");
  });

  it("shows free shipping when subtotal >= $50", () => {
    function Setup() {
      const { dispatch } = useCart();
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: mockProduct })}
          >
            add
          </button>
          <CartSummary />
        </>
      );
    }
    renderWithCart(<Setup />);
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("shipping")).toHaveTextContent("Free");
  });

  it("removes item when the ✕ button is clicked", () => {
    function Setup() {
      const { dispatch } = useCart();
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: cheapProduct })}
          >
            add
          </button>
          <CartSummary />
        </>
      );
    }
    renderWithCart(<Setup />);
    fireEvent.click(screen.getByText("add"));
    expect(
      screen.getByTestId(`cart-item-${cheapProduct.id}`),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(`remove-${cheapProduct.id}`));
    expect(
      screen.queryByTestId(`cart-item-${cheapProduct.id}`),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("empty-cart")).toBeInTheDocument();
  });

  it("increments quantity with the + button", () => {
    function Setup() {
      const { dispatch } = useCart();
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: cheapProduct })}
          >
            add
          </button>
          <CartSummary />
        </>
      );
    }
    renderWithCart(<Setup />);
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByTestId(`inc-${cheapProduct.id}`));
    expect(screen.getByTestId(`qty-${cheapProduct.id}`)).toHaveTextContent("2");
  });

  it("decrements quantity with the − button, clamped to 1", () => {
    function Setup() {
      const { dispatch } = useCart();
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: cheapProduct })}
          >
            add
          </button>
          <CartSummary />
        </>
      );
    }
    renderWithCart(<Setup />);
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByTestId(`dec-${cheapProduct.id}`));
    expect(screen.getByTestId(`qty-${cheapProduct.id}`)).toHaveTextContent("1");
  });

  it("shows error for an invalid discount code", async () => {
    const user = userEvent.setup();
    function Setup() {
      const { dispatch } = useCart();
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: mockProduct })}
          >
            add
          </button>
          <CartSummary />
        </>
      );
    }
    renderWithCart(<Setup />);
    fireEvent.click(screen.getByText("add"));
    await user.type(screen.getByTestId("code-input"), "BOGUS");
    fireEvent.click(screen.getByTestId("apply-code"));
    expect(screen.getByTestId("code-error")).toHaveTextContent(
      "Invalid discount code",
    );
  });

  it("applies a valid SAVE10 code and shows confirmation + updated total", async () => {
    const user = userEvent.setup();
    function Setup() {
      const { dispatch } = useCart();
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: mockProduct })}
          >
            add
          </button>
          <CartSummary />
        </>
      );
    }
    renderWithCart(<Setup />);
    fireEvent.click(screen.getByText("add"));
    await user.type(screen.getByTestId("code-input"), "SAVE10");
    fireEvent.click(screen.getByTestId("apply-code"));
    expect(screen.getByTestId("code-applied")).toHaveTextContent("SAVE10");
    expect(screen.getByTestId("discount-amount")).toHaveTextContent("−$100.00");
    expect(screen.getByTestId("total")).toHaveTextContent("$899.99");
  });

  it('clears the cart when "Place Order" is clicked', () => {
    function Setup() {
      const { dispatch } = useCart();
      return (
        <>
          <button
            onClick={() => dispatch({ type: "ADD_ITEM", item: cheapProduct })}
          >
            add
          </button>
          <CartSummary />
        </>
      );
    }
    renderWithCart(<Setup />);
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByTestId("checkout-btn"));
    expect(screen.getByTestId("empty-cart")).toBeInTheDocument();
  });
});
