
import { useState, useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";

import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";

import "./App.css";

const CART_STORAGE_KEY = "slowBrewCart";

function getSavedCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);

    return Array.isArray(parsedCart)
      ? parsedCart.filter(
          (item) =>
            item &&
            (
              (typeof item.id === "string" && item.id.trim() !== "") ||
              Number.isFinite(item.id)
            ) &&
            Number.isFinite(item.price) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        )
      : [];
  } catch {
    return [];
  }
}

const categories = [
  "Coffee",
  "Beverages",
  "Brownies",
  "Pizzas",
  "Burgers",
  "Subs",
  "Sandwiches",
  "Fries",
];

function CartIcon({ className = "", size = 19 }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function addItemToCart(cart, item) {
  const existingItem = cart.find(
    (cartItem) => cartItem.id === item.id
  );

  if (existingItem) {
    return cart.map((cartItem) =>
      cartItem.id === item.id
        ? {
            ...cartItem,
            quantity: cartItem.quantity + 1,
          }
        : cartItem
    );
  }

  return [...cart, { ...item, quantity: 1 }];
}

function Navbar({ cartCount }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <nav className="navbar">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          the slow brew<span>.</span>
        </Link>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div
          className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}
        >
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>

          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>

          <NavLink to="/menu" onClick={closeMenu}>
            Menu
          </NavLink>

          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>

          <NavLink
            to="/cart"
            className="nav-cart-link"
            onClick={closeMenu}
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <CartIcon className="nav-cart-icon" />
            <span>Cart</span>
            <span className="nav-cart-count">{cartCount}</span>
          </NavLink>

          <Link
            to="/menu"
            className="nav-order-button"
            onClick={closeMenu}
          >
            Order Online <span>↗</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="cafe-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            the slow brew<span>.</span>
          </Link>

          <p>
            A little coffee, a little comfort,
            <br />
            and a place to slow down.
          </p>

          <div className="footer-social-icons">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              ig <span>↗</span>
            </a>

            <a href="mailto:hello@slowbrew.com" aria-label="Email">
              @
            </a>
          </div>
        </div>

        <div className="footer-links">
          <span className="footer-label">EXPLORE</span>
          <Link to="/">Home</Link>
          <Link to="/menu">Our Menu</Link>
          <Link to="/about">Our Story</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-social">
          <span className="footer-label">SAY HELLO</span>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram <span>↗</span>
          </a>

          <a href="mailto:hello@slowbrew.com">
            Email us <span>↗</span>
          </a>

          <p>Good coffee. Good company.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} The Slow Brew</span>

        <span className="footer-made">
          Brewed with <span>♥</span> &amp; care
        </span>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">
            <span className="eyebrow-line" />
            YOUR EVERYDAY COFFEE ESCAPE
          </span>

          <h1>
            Slow down.
            <br />
            <span>Sip something</span>
            <br />
            beautiful.
          </h1>

          <p className="hero-description">
            Thoughtfully brewed coffee, little moments of
            happiness, and a cozy corner that feels like yours.
          </p>

          <div className="hero-actions">
            <Link to="/menu" className="primary-button">
              Explore our menu <span>↗</span>
            </Link>

            <Link to="/about" className="text-button">
              Our story <span>→</span>
            </Link>
          </div>

          <div className="hero-note">
            <span className="hero-note-icon">✳</span>
            <span>Freshly brewed, always made with love.</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=90"
              alt="Warm and welcoming coffee shop"
              className="hero-image"
            />
          </div>

          <div className="hero-image-caption">
            <span>YOUR LITTLE CORNER OF CALM</span>
            <span>EST. WITH LOVE</span>
          </div>

          <div className="hero-sticker">
            <span>coffee</span>
            <span>&amp;</span>
            <span>comfort</span>
          </div>
        </div>

        <div className="hero-bottom-note">
          <span>01 / A MOMENT FOR YOURSELF</span>
          <span>MADE FOR SLOWER DAYS ↓</span>
        </div>
      </section>

      <section className="home-intro">
        <span className="eyebrow">A LITTLE ABOUT US</span>

        <h2>
          More than coffee.
          <br />
          <span>A feeling.</span>
        </h2>

        <p>
          Some days call for a strong coffee. Others call for a
          quiet corner and nowhere to be. We made this space for
          both.
        </p>

        <Link to="/about" className="underlined-link">
          Get to know us <span>↗</span>
        </Link>
      </section>

      <section className="home-quote">
        <span className="quote-mark">“</span>

        <p>
          Life is too short for bad coffee
          <br />
          and hurried mornings.
        </p>

        <span className="quote-caption">TAKE YOUR TIME.</span>
      </section>
    </main>
  );
}

function Menu({ onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/admin/menu"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load menu items"
          );
        }

        const formattedItems = data.menuItems.map((item) => ({
          id: item._id,
          name: item.name,
          category: item.category,
          price: Number(item.price),
          description: item.description,
          image: item.image
            ? `http://localhost:5000${item.image}`
            : "",
        }));

        setMenuItems(formattedItems);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter(
          (item) => item.category === activeCategory
        );

  return (
    <main className="inner-page menu-page">
      <section className="page-heading menu-heading">
        <span className="eyebrow">
          SOMETHING GOOD IS BREWING
        </span>

        <h1>
          Made to be <span>savoured.</span>
        </h1>

        <p>
          From your first morning sip to your afternoon treat,
          find something that makes your day a little better.
        </p>
      </section>

      <section className="menu-catalog">
        <div className="menu-toolbar">
          <div
            className="menu-tabs"
            role="group"
            aria-label="Filter menu by category"
          >
            {["All", ...categories].map((category) => (
              <button
                className={`menu-tab ${
                  activeCategory === category ? "active" : ""
                }`}
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>

          <span className="menu-count">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        {loading ? (
          <div className="menu-empty-state">
            <h2>Loading our menu...</h2>
            <p>Please wait while we prepare something good.</p>
          </div>
        ) : error ? (
          <div className="menu-empty-state">
            <h2>Unable to load menu.</h2>
            <p>{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="menu-empty-state">
            <span className="eyebrow">
              FRESHLY BREWED, COMING SOON
            </span>

            <h2>More good things are on the way.</h2>

            <p>
              We're preparing something lovely for this category.
              Please check back soon.
            </p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <article className="menu-card" key={item.id}>
                <div className="menu-card-image">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                    />
                  )}

                  <span className="menu-card-category">
                    {item.category}
                  </span>
                </div>

                <div className="menu-card-content">
                  <div className="menu-card-title-row">
                    <h2>{item.name}</h2>
                    <span className="item-price">
                      ₹{item.price}
                    </span>
                  </div>

                  <p>{item.description}</p>

                  <button
                    type="button"
                    className="menu-enquire-link"
                    onClick={() => onAddToCart(item)}
                    aria-label={`Add ${item.name} to cart`}
                  >
                    <CartIcon
                      className="add-cart-icon"
                      size={16}
                    />

                    <span className="add-cart-text">
                      Add to Cart
                    </span>

                    <span className="add-cart-plus">+</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="menu-bottom-note">
        <span>GOOD THINGS TAKE TIME.</span>
        <p>Find your favourite. Make yourself comfortable.</p>
      </section>
    </main>
  );
}

function About() {
  return (
    <main className="inner-page about-page">
      <section className="page-heading">
        <span className="eyebrow">OUR LITTLE STORY</span>

        <h1>
          Coffee with a little more <span>heart.</span>
        </h1>

        <p>
          We believe the best moments are often the simplest
          ones — a warm cup, familiar faces, and time to breathe.
        </p>
      </section>

      <section className="about-story">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=85"
            alt="Coffee being prepared with care"
          />
        </div>

        <div className="about-copy">
          <span className="eyebrow">THE SLOW BREW WAY</span>

          <h2>
            A slower pace.
            <br />
            A better <span>cup.</span>
          </h2>

          <p>
            The Slow Brew is built around a simple idea: coffee
            should be more than something you grab on the way
            somewhere.
          </p>

          <p>
            It can be a pause between busy hours, a long
            conversation with a friend, or a little ritual that
            makes an ordinary day feel special.
          </p>

          <p>
            Every detail of our café is inspired by warmth,
            simplicity, and the joy of taking your time.
          </p>

          <Link to="/menu" className="primary-button">
            Find your favourite <span>↗</span>
          </Link>
        </div>
      </section>

      <section className="about-values">
        <div>
          <span>01</span>
          <h3>Made with care</h3>
          <p>Thoughtful details in every cup we serve.</p>
        </div>

        <div>
          <span>02</span>
          <h3>Room to unwind</h3>
          <p>A welcoming place to pause and feel at home.</p>
        </div>

        <div>
          <span>03</span>
          <h3>Moments that matter</h3>
          <p>Good coffee tastes even better together.</p>
        </div>
      </section>
    </main>
  );
}

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const subject = encodeURIComponent(
      `Cafe enquiry from ${formData.name}`
    );

    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );

    window.location.href =
      `mailto:hello@slowbrew.com?subject=${subject}&body=${body}`;
  }

  return (
    <main className="inner-page contact-page">
      <section className="page-heading">
        <span className="eyebrow">
          WE'D LOVE TO HEAR FROM YOU
        </span>

        <h1>
          Let's have a <span>little chat.</span>
        </h1>

        <p>
          Questions, kind words, or just a coffee recommendation?
          Our inbox is open.
        </p>
      </section>

      <section className="contact-layout">
        <div className="contact-details">
          <span className="eyebrow">COME SAY HELLO</span>

          <h2>
            Every good thing
            <br />
            starts with a <span>hello.</span>
          </h2>

          <div className="contact-detail-item">
            <span className="contact-detail-number">01</span>

            <div>
              <h3>Email</h3>
              <a href="mailto:hello@slowbrew.com">
                hello@slowbrew.com
              </a>
            </div>
          </div>

          <div className="contact-detail-item">
            <span className="contact-detail-number">02</span>

            <div>
              <h3>Opening hours</h3>
              <p>Monday – Sunday</p>
              <p>9:00 AM – 9:00 PM</p>
            </div>
          </div>

          <div className="contact-detail-item">
            <span className="contact-detail-number">03</span>

            <div>
              <h3>Follow along</h3>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
              >
                Instagram ↗
              </a>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <span className="eyebrow">DROP US A NOTE</span>
          <h2>What's on your mind?</h2>

          <label htmlFor="contact-name">Your name</label>

          <input
            id="contact-name"
            name="name"
            type="text"
            placeholder="What should we call you?"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="contact-email">Email address</label>

          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="contact-message">Your message</label>

          <textarea
            id="contact-message"
            name="message"
            placeholder="Tell us a little something..."
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="primary-button contact-submit"
          >
            Send your message <span>↗</span>
          </button>

          <p className="form-note">
            This opens your default email app to send the message.
          </p>
        </form>
      </section>
    </main>
  );
}


function Cart({ cart, onUpdateQuantity, onRemoveItem }) {
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <main className="inner-page cart-page">
      <section className="page-heading">
        <span className="eyebrow">
          YOUR SLOW BREW FAVOURITES
        </span>

        <h1>
          Your <span>cart.</span>
        </h1>

        <p>Good choices deserve a place at your table.</p>
      </section>

      {cart.length === 0 ? (
        <div className="menu-empty-state cart-empty-state">
          <div className="cart-empty-icon">♡</div>

          <h2>Your cart is empty.</h2>

          <p>
            Find something delicious to make your day better.
          </p>

          <Link to="/menu" className="nav-order-button">
            Explore Menu <span>↗</span>
          </Link>
        </div>
      ) : (
        <section className="cart-content">
          <div className="cart-items">
            <div className="cart-items-heading">
              <h2>Your items</h2>
              <span>
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>

            {cart.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>{item.name.charAt(0)}</span>
                  )}
                </div>

                <div className="cart-item-details">
                  <span className="cart-item-category">
                    {item.category}
                  </span>

                  <h2>{item.name}</h2>

                  <span className="cart-item-unit-price">
                    ₹{item.price} <small>/ item</small>
                  </span>

                  <div className="cart-item-actions">
                    <div className="cart-quantity-controls">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() =>
                          onUpdateQuantity(item.id, -1)
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() =>
                          onUpdateQuantity(item.id, 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <strong className="cart-item-subtotal">
                  ₹{item.price * item.quantity}
                </strong>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <span className="cart-summary-eyebrow">
              YOUR LITTLE INDULGENCE
            </span>

            <h2>Order Summary</h2>

            <div className="cart-summary-item-count">
              <span>Items in your cart</span>
              <span>{totalItems}</span>
            </div>

            <div className="cart-summary-row">
              <span>Items total</span>
              <strong>₹{total}</strong>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-total">
              <span>Total amount</span>
              <strong>₹{total}</strong>
            </div>

            <button
              type="button"
              className="cart-checkout-button"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout <span>↗</span>
            </button>

            <p className="cart-summary-note">
              Your favourites are just one step away.
            </p>

            <Link to="/menu" className="cart-continue-link">
              ← Continue shopping
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}


function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}


function Checkout({ cart, onOrderSuccess }) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Feedback states
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackPopupOpen, setFeedbackPopupOpen] = useState(false);

  // Automatically open feedback popup after order success
  useEffect(() => {
    if (orderSuccess) {
      setFeedbackPopupOpen(true);
    }
  }, [orderSuccess]);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // PLACE ORDER
  async function handleSubmit(event) {
    event.preventDefault();

    if (!/^\d{10}$/.test(mobileNumber)) {
      setNotice("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!tableNumber) {
      setNotice("Please select your table number.");
      return;
    }

    try {
      setLoading(true);
      setNotice("");

      // ONLINE PAYMENT
      if (paymentMethod === "Online") {
        const scriptLoaded = await loadRazorpayScript();

        if (!scriptLoaded) {
          throw new Error(
            "Unable to load Razorpay. Please check your internet connection."
          );
        }

        const response = await fetch(
          "http://localhost:5000/api/orders/create-razorpay-order",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: cart.map((item) => ({
                id: item.id,
                quantity: item.quantity,
              })),
              mobile: mobileNumber,
              tableNumber: Number(tableNumber),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to create payment order."
          );
        }

        const options = {
          key: data.key,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: "The Slow Brew",
          description: "Cafe Order Payment",
          order_id: data.razorpayOrder.id,

          prefill: {
            contact: mobileNumber,
          },

          theme: {
            color: "#38291f",
          },

          handler: async function (paymentResponse) {
            try {
              setLoading(true);
              setNotice("");

              const verifyResponse = await fetch(
                "http://localhost:5000/api/orders/verify-payment",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    orderId: data.order._id,
                    razorpay_order_id:
                      paymentResponse.razorpay_order_id,
                    razorpay_payment_id:
                      paymentResponse.razorpay_payment_id,
                    razorpay_signature:
                      paymentResponse.razorpay_signature,
                  }),
                }
              );

              const verifyData = await verifyResponse.json();

              if (!verifyResponse.ok) {
                throw new Error(
                  verifyData.message ||
                    "Payment verification failed."
                );
              }

              setOrderSuccess(verifyData.order);
              onOrderSuccess();
            } catch (error) {
              setNotice(error.message);
            } finally {
              setLoading(false);
            }
          },

          modal: {
            ondismiss: function () {
              setNotice(
                "Payment was not completed. You can try again."
              );
              setLoading(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);

        razorpay.on("payment.failed", function (paymentError) {
          setNotice(
            paymentError.error.description ||
              "Payment failed. Please try again."
          );
          setLoading(false);
        });

        razorpay.open();

        setLoading(false);
        return;
      }

      // CASH PAYMENT
      const response = await fetch(
        "http://localhost:5000/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cart.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
            mobile: mobileNumber,
            tableNumber: Number(tableNumber),
            paymentMethod: "Cash",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to place your order."
        );
      }

      setOrderSuccess(data.order);
      onOrderSuccess();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  // SUBMIT CUSTOMER FEEDBACK
  async function handleFeedbackSubmit(event) {
    event.preventDefault();

    if (!feedbackMessage.trim()) {
      setFeedbackNotice("Please write your feedback message.");
      return;
    }

    try {
      setFeedbackLoading(true);
      setFeedbackNotice("");

      const response = await fetch(
        "http://localhost:5000/api/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderSuccess._id,
            rating: feedbackRating,
            message: feedbackMessage.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit feedback."
        );
      }

      setFeedbackSubmitted(true);
      setFeedbackNotice("");
    } catch (error) {
      setFeedbackNotice(error.message);
    } finally {
      setFeedbackLoading(false);
    }
  }

  // ORDER RECEIPT
  if (orderSuccess) {
    const orderDate = new Date(orderSuccess.createdAt);

    return (
      <main className="inner-page checkout-page receipt-page">
        <div className="receipt">
          <div className="receipt-header">
            <h1>THE SLOW BREW</h1>
            <p>COFFEE • FOOD • GOOD MOMENTS</p>

            <div className="receipt-divider">
              --------------------------------
            </div>

            <h2>ORDER RECEIPT</h2>
            <p>Thank you for ordering!</p>
          </div>

          <div className="receipt-details">
            <div>
              <span>Order ID</span>
              <strong>{orderSuccess._id}</strong>
            </div>

            <div>
              <span>Date</span>
              <strong>
                {orderDate.toLocaleDateString("en-IN")}
              </strong>
            </div>

            <div>
              <span>Time</span>
              <strong>
                {orderDate.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </div>

            <div>
              <span>Customer Mobile</span>
              <strong>{orderSuccess.mobile}</strong>
            </div>

            <div>
              <span>Table Number</span>
              <strong>{orderSuccess.tableNumber}</strong>
            </div>
          </div>

          <div className="receipt-divider">
            --------------------------------
          </div>

          <h3 className="receipt-items-heading">
            ORDERED ITEMS
          </h3>

          <div className="receipt-items">
            {orderSuccess.items.map((item, index) => (
              <div
                className="receipt-item"
                key={item._id || index}
              >
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.quantity} × ₹{item.price}
                  </span>
                </div>

                <strong>
                  ₹{item.price * item.quantity}
                </strong>
              </div>
            ))}
          </div>

          <div className="receipt-divider">
            --------------------------------
          </div>

          <div className="receipt-total">
            <strong>TOTAL AMOUNT</strong>
            <strong>₹{orderSuccess.totalAmount}</strong>
          </div>

          <div className="receipt-payment">
            <div>
              <span>Payment Method</span>
              <strong>{orderSuccess.paymentMethod}</strong>
            </div>

            <div>
              <span>Payment Status</span>

              <strong
                className={
                  orderSuccess.paymentStatus === "Paid"
                    ? "receipt-paid"
                    : "receipt-unpaid"
                }
              >
                {orderSuccess.paymentStatus.toUpperCase()}
              </strong>
            </div>
          </div>

          {orderSuccess.paymentMethod === "Cash" &&
            orderSuccess.paymentStatus === "Unpaid" && (
              <p className="receipt-cash-note">
                Please show this receipt at the café counter
                and complete your cash payment.
              </p>
            )}

          <div className="receipt-footer">
            <h3>THANK YOU!</h3>
            <p>We hope to see you again.</p>
            <span>GOOD COFFEE. GOOD COMPANY.</span>
          </div>

          <div className="receipt-actions">
            <button
              type="button"
              onClick={() => window.print()}
              className="receipt-print-button"
            >
              Print Receipt
            </button>

            <Link to="/menu" className="receipt-menu-button">
              Back to Menu
            </Link>
          </div>
        </div>

        {/* AUTOMATIC FEEDBACK POPUP */}
        {feedbackPopupOpen && (
          <div className="feedback-popup-overlay">
            <div
              className="feedback-popup"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-popup-title"
            >
              <button
                type="button"
                className="feedback-popup-close"
                onClick={() => setFeedbackPopupOpen(false)}
                aria-label="Close feedback popup"
              >
                ×
              </button>

              {feedbackSubmitted ? (
                <div className="feedback-success">
                  <span className="feedback-success-icon">
                    ♥
                  </span>

                  <h3>Thank you!</h3>

                  <p>
                    Your feedback means a lot to us.
                    We hope to see you again soon.
                  </p>

                  <button
                    type="button"
                    className="feedback-submit-button"
                    onClick={() => setFeedbackPopupOpen(false)}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <span className="eyebrow">
                    THE SLOW BREW
                  </span>

                  <h2 id="feedback-popup-title">
                    How was your experience?
                  </h2>

                  <p className="feedback-description">
                    We'd love to hear your thoughts!
                  </p>

                  <form
                    className="customer-feedback-form"
                    onSubmit={handleFeedbackSubmit}
                  >
                    <label className="feedback-rating-label">
                      Rate your experience
                    </label>

                    <div className="feedback-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className={
                            star <= feedbackRating
                              ? "feedback-star active"
                              : "feedback-star"
                          }
                          onClick={() =>
                            setFeedbackRating(star)
                          }
                          aria-label={`Give ${star} star rating`}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    <label htmlFor="customer-feedback-message">
                      Tell us more
                    </label>

                    <textarea
                      id="customer-feedback-message"
                      rows="4"
                      placeholder="Write your experience here..."
                      value={feedbackMessage}
                      onChange={(event) => {
                        setFeedbackMessage(event.target.value);
                        setFeedbackNotice("");
                      }}
                      required
                    />

                    <button
                      type="submit"
                      className="feedback-submit-button"
                      disabled={feedbackLoading}
                    >
                      {feedbackLoading
                        ? "Submitting..."
                        : "Submit Feedback"}
                    </button>

                    {feedbackNotice && (
                      <p
                        className="feedback-notice"
                        role="status"
                      >
                        {feedbackNotice}
                      </p>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    );
  }

  // NORMAL CHECKOUT FORM
  return (
    <main className="inner-page checkout-page">
      <section className="page-heading checkout-heading">
        <span className="eyebrow">JUST ONE MORE STEP</span>

        <h1>
          Complete your <span>order.</span>
        </h1>

        <p>
          A few details and your favourite café treats will be one step
          closer.
        </p>
      </section>

      {cart.length === 0 ? (
        <div className="menu-empty-state checkout-empty-state">
          <h2>Your cart is empty.</h2>

          <p>Add something delicious before moving to checkout.</p>

          <Link to="/menu" className="nav-order-button">
            Explore Menu <span>↗</span>
          </Link>
        </div>
      ) : (
        <section className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="checkout-section-heading">
              <span className="eyebrow">YOUR DETAILS</span>

              <h2>Where should we serve you?</h2>

              <p>
                We only need your mobile number and table number.
              </p>
            </div>

            <label htmlFor="checkout-mobile">
              Mobile number
            </label>

            <input
              id="checkout-mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="Enter 10-digit mobile number"
              value={mobileNumber}
              maxLength={10}
              onChange={(event) => {
                setMobileNumber(
                  event.target.value.replace(/\D/g, "").slice(0, 10)
                );
                setNotice("");
              }}
              required
            />

            <span className="checkout-field-note">
              Enter your 10-digit mobile number.
            </span>

            <label htmlFor="checkout-table">
              Table number
            </label>

            <select
              id="checkout-table"
              value={tableNumber}
              onChange={(event) => {
                setTableNumber(event.target.value);
                setNotice("");
              }}
              required
            >
              <option value="">Select your table</option>

              {Array.from({ length: 10 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  Table {index + 1}
                </option>
              ))}
            </select>

            <div className="checkout-payment-heading">
              <span className="eyebrow">PAYMENT METHOD</span>

              <h2>How would you like to pay?</h2>
            </div>

            <div className="checkout-payment-options">
              <label
                className={`checkout-payment-option ${
                  paymentMethod === "Cash" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash"
                  checked={paymentMethod === "Cash"}
                  onChange={() => {
                    setPaymentMethod("Cash");
                    setNotice("");
                  }}
                />

                <span className="checkout-radio-mark" />

                <span className="checkout-payment-copy">
                  <strong>Cash</strong>
                  <small>Pay at the café counter</small>
                </span>
              </label>

              <label
                className={`checkout-payment-option ${
                  paymentMethod === "Online" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Online"
                  checked={paymentMethod === "Online"}
                  onChange={() => {
                    setPaymentMethod("Online");
                    setNotice("");
                  }}
                />

                <span className="checkout-radio-mark" />

                <span className="checkout-payment-copy">
                  <strong>Online payment</strong>
                  <small>Pay securely online</small>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="primary-button checkout-submit"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : paymentMethod === "Online"
                ? `Pay ₹${total}`
                : "Confirm order"}
              <span>↗</span>
            </button>

            {notice && (
              <p className="checkout-notice" role="status">
                {notice}
              </p>
            )}
          </form>

          <aside className="checkout-order-summary">
            <span className="eyebrow">
              A LITTLE SOMETHING FOR YOU
            </span>

            <h2>Your order</h2>

            <div className="checkout-order-items">
              {cart.map((item) => (
                <div
                  className="checkout-order-item"
                  key={item.id}
                >
                  <div className="checkout-order-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>{item.name.charAt(0)}</span>
                    )}
                  </div>

                  <div className="checkout-order-item-details">
                    <strong>{item.name}</strong>

                    <span>
                      Qty {item.quantity} × ₹{item.price}
                    </span>
                  </div>

                  <strong className="checkout-order-item-price">
                    ₹{item.price * item.quantity}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-total-row">
              <span>Items total</span>
              <strong>₹{total}</strong>
            </div>

            <div className="checkout-total-row checkout-grand-total">
              <strong>Total to pay</strong>
              <strong>₹{total}</strong>
            </div>

            <Link to="/cart" className="checkout-back-link">
              ← Back to cart
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}


// Protect Admin Dashboard
function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();

  const [cart, setCart] = useState(getSavedCart);

  const isAdminPath = location.pathname.startsWith("/admin");

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch {
      // Cart remains available during the current session.
    }
  }, [cart]);

  function handleAddToCart(item) {
    setCart((currentCart) =>
      addItemToCart(currentCart, item)
    );
  }

  function handleUpdateQuantity(itemId, change) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: item.quantity + change,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function handleRemoveItem(itemId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== itemId)
    );
  }

  function handleOrderSuccess() {
    setCart([]);
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="cafe-website">
      {!isAdminPath && <Navbar cartCount={cartCount} />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/menu"
          element={<Menu onAddToCart={handleAddToCart} />}
        />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              onOrderSuccess={handleOrderSuccess}
            />
          }
        />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        <Route path="*" element={<Home />} />
      </Routes>

      {!isAdminPath &&
        !["/cart", "/checkout"].includes(location.pathname) && (
          <Footer />
        )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
