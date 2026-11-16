
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000/api/admin";
const ORDERS_API_URL = "http://localhost:5000/api/orders";
const FEEDBACK_API_URL = "http://localhost:5000/api/feedback";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "Coffee",
};

const MENU_CATEGORIES = [
  "Coffee",
  "Beverages",
  "Brownies",
  "Pizzas",
  "Burgers",
  "Subs",
  "Sandwiches",
  "Fries",
];

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("menu");

  // Menu States
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingItemId, setDeletingItemId] = useState(null);

  // Order States
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Feedback States
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  // Add Menu Form States
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  // Image Preview
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return;
    }

    const imageUrl = URL.createObjectURL(selectedImage);
    setImagePreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [selectedImage]);

  // Fetch Menu Items
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/menu`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch menu items");
      }

      setMenuItems(data.menuItems || []);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Customer Orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${ORDERS_API_URL}/admin`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data.orders || []);
    } catch (error) {
      setOrdersError(error.message || "Something went wrong");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch Customer Feedback
  const fetchFeedback = async () => {
    try {
      setFeedbackLoading(true);
      setFeedbackError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${FEEDBACK_API_URL}/admin`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch customer feedback"
        );
      }

      setFeedbacks(data.feedbacks || []);
    } catch (error) {
      setFeedbackError(error.message || "Something went wrong");
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchMenuItems();
    fetchOrders();
    fetchFeedback();
  }, []);

  // Form Input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setSelectedImage(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a JPG, PNG or WEBP image.");
      e.target.value = "";
      setSelectedImage(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB.");
      e.target.value = "";
      setSelectedImage(null);
      return;
    }

    setMessage("");
    setSelectedImage(file);
  };

  // Add Menu Item
  const handleAddMenuItem = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Please login again.");
      }

      const menuFormData = new FormData();

      menuFormData.append("name", formData.name);
      menuFormData.append("description", formData.description);
      menuFormData.append("price", formData.price);
      menuFormData.append("category", formData.category);

      if (selectedImage) {
        menuFormData.append("image", selectedImage);
      }

      const response = await fetch(`${API_URL}/menu`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: menuFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add menu item");
      }

      setMenuItems((previousItems) => [
        data.menuItem,
        ...previousItems,
      ]);

      setFormData(initialForm);
      setSelectedImage(null);
      setShowForm(false);
      setMessage("Menu item added successfully!");

      e.target.reset();
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Delete Menu Item
  const handleDeleteMenuItem = async (itemId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently remove this menu item?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingItemId(itemId);
      setMessage("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/menu/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete menu item");
      }

      setMenuItems((previousItems) =>
        previousItems.filter((item) => item._id !== itemId)
      );

      setMessage("Menu item removed successfully!");
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setDeletingItemId(null);
    }
  };

  // Format Date
  const formatOrderDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-brand-icon">S</span>
          <h2>THE SLOW BREW</h2>
        </div>

        <p className="admin-sidebar-label">MENU</p>

        <nav className="admin-sidebar-nav">
          <button
            className={`admin-nav-item ${
              activeSection === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className={`admin-nav-item ${
              activeSection === "menu" ? "active" : ""
            }`}
            onClick={() => setActiveSection("menu")}
          >
            <span>☕</span>
            Manage Menu
          </button>

          <button
            className={`admin-nav-item ${
              activeSection === "orders" ? "active" : ""
            }`}
            onClick={() => {
              setActiveSection("orders");
              fetchOrders();
            }}
          >
            <span>▤</span>
            Customer Orders
          </button>

          <button
            className={`admin-nav-item ${
              activeSection === "feedback" ? "active" : ""
            }`}
            onClick={() => {
              setActiveSection("feedback");
              fetchFeedback();
            }}
          >
            <span>✉</span>
            Feedback
          </button>
        </nav>

        <button
          className="admin-logout-button"
          onClick={handleLogout}
        >
          ↪ Logout
        </button>
      </aside>

      <section className="admin-dashboard-content">
        <header className="admin-dashboard-header">
          <div>
            <span>THE SLOW BREW / ADMIN</span>

            <h1>
              {activeSection === "orders"
                ? "Customer Orders"
                : activeSection === "menu"
                ? "Manage Menu"
                : activeSection === "feedback"
                ? "Customer Feedback"
                : "Dashboard"}
            </h1>
          </div>

          <div className="admin-profile">
            <span className="admin-profile-icon">A</span>

            <div>
              <strong>Administrator</strong>
              <p>Admin Account</p>
            </div>
          </div>
        </header>

        <div className="admin-welcome">
          <h2>Welcome to The Slow Brew!</h2>
          <p>
            Manage your café menu, customer orders and feedback
            from one place.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="admin-dashboard-cards">
          <div className="admin-dashboard-card">
            <span>Total Menu Items</span>
            <h2>{loading ? "..." : menuItems.length}</h2>
            <p>Available menu items</p>
          </div>

          <div className="admin-dashboard-card">
            <span>Customer Orders</span>
            <h2>{ordersLoading ? "..." : orders.length}</h2>
            <p>Total orders received</p>
          </div>

          <div className="admin-dashboard-card">
            <span>Customer Feedback</span>
            <h2>{feedbackLoading ? "..." : feedbacks.length}</h2>
            <p>Total feedback received</p>
          </div>
        </div>

        {/* MENU SECTION */}
        {activeSection === "menu" && (
          <div className="admin-menu-section">
            <div className="admin-menu-section-header">
              <div>
                <h2>Menu Items</h2>
                <p>Manage your café menu category by category.</p>
              </div>

              <button
                className="admin-add-button"
                onClick={() => {
                  setShowForm(!showForm);
                  setMessage("");
                }}
              >
                {showForm ? "Close Form" : "+ Add Menu Item"}
              </button>
            </div>

            {message && (
              <p className="admin-form-message">{message}</p>
            )}

            {showForm && (
              <form
                className="admin-add-form"
                onSubmit={handleAddMenuItem}
              >
                <h3>Add New Menu Item</h3>

                <div className="admin-input-group">
                  <label htmlFor="item-name">Item Name</label>
                  <input
                    id="item-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Classic Cappuccino"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label htmlFor="item-description">
                    Description
                  </label>
                  <textarea
                    id="item-description"
                    name="description"
                    placeholder="Enter item description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-input-group">
                    <label htmlFor="item-price">Price (₹)</label>
                    <input
                      id="item-price"
                      type="number"
                      name="price"
                      placeholder="Enter price"
                      min="1"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="admin-input-group">
                    <label htmlFor="item-category">Category</label>
                    <select
                      id="item-category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      {MENU_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-input-group">
                  <label htmlFor="item-image">
                    Select Item Image (Optional)
                  </label>

                  <input
                    id="item-image"
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                  />

                  <small>
                    JPG, PNG or WEBP. Maximum size: 5 MB.
                  </small>
                </div>

                {imagePreview && (
                  <div className="admin-image-preview">
                    <p>Image Preview</p>

                    <img
                      src={imagePreview}
                      alt="Selected menu item preview"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        const imageInput =
                          document.getElementById("item-image");

                        if (imageInput) imageInput.value = "";
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Menu Item"}
                </button>
              </form>
            )}

            <div className="admin-menu-count">
              {menuItems.length} Items
            </div>

            {loading && (
              <p className="admin-menu-message">
                Loading menu items...
              </p>
            )}

            {error && (
              <p className="admin-menu-error">{error}</p>
            )}

            {!loading && !error && menuItems.length === 0 && (
              <div className="admin-menu-empty">
                <span>☕</span>
                <h3>No Menu Items Found</h3>
                <p>
                  Your menu is currently empty.
                  Add your first menu item to get started.
                </p>
              </div>
            )}

            {/* CATEGORY WISE MENU CARDS */}
            {!loading && !error && menuItems.length > 0 && (
              <div className="admin-category-container">
                {MENU_CATEGORIES.map((category) => {
                  const categoryItems = menuItems.filter(
                    (item) => item.category === category
                  );

                  return (
                    <section
                      className="admin-category-section"
                      key={category}
                    >
                      <div className="admin-category-header">
                        <div>
                          <h3>{category}</h3>
                          <p>
                            Manage your {category.toLowerCase()} items
                          </p>
                        </div>

                        <span className="admin-category-count">
                          {categoryItems.length} Items
                        </span>
                      </div>

                      {categoryItems.length === 0 ? (
                        <div className="admin-category-empty">
                          No items added in this category yet.
                        </div>
                      ) : (
                        <div className="admin-category-grid">
                          {categoryItems.map((item) => (
                            <article
                              className="admin-menu-card"
                              key={item._id}
                            >
                              {item.image ? (
                                <img
                                  className="admin-menu-card-image"
                                  src={`http://localhost:5000${item.image}`}
                                  alt={item.name}
                                />
                              ) : (
                                <div className="admin-menu-card-placeholder">
                                  ☕
                                </div>
                              )}

                              <div className="admin-menu-card-content">
                                <h4>{item.name}</h4>

                                <p>{item.description}</p>

                                <div className="admin-menu-card-bottom">
                                  <strong>₹{item.price}</strong>

                                  <button
                                    type="button"
                                    className="admin-delete-button"
                                    onClick={() =>
                                      handleDeleteMenuItem(item._id)
                                    }
                                    disabled={
                                      deletingItemId === item._id
                                    }
                                  >
                                    {deletingItemId === item._id
                                      ? "Removing..."
                                      : "Remove"}
                                  </button>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER ORDERS SECTION */}
        {activeSection === "orders" && (
          <div className="admin-orders-section">
            <div className="admin-orders-header">
              <div>
                <h2>Customer Orders</h2>
                <p>View all orders placed by your customers.</p>
              </div>

              <button
                className="admin-add-button"
                onClick={fetchOrders}
                disabled={ordersLoading}
              >
                {ordersLoading ? "Refreshing..." : "↻ Refresh Orders"}
              </button>
            </div>

            <div className="admin-orders-count">
              {orders.length} Total Orders
            </div>

            {ordersLoading && (
              <p className="admin-menu-message">
                Loading customer orders...
              </p>
            )}

            {ordersError && (
              <p className="admin-menu-error">{ordersError}</p>
            )}

            {!ordersLoading &&
              !ordersError &&
              orders.length === 0 && (
                <div className="admin-menu-empty">
                  <span>▤</span>
                  <h3>No Orders Found</h3>
                  <p>Customer orders will appear here.</p>
                </div>
              )}

            {!ordersLoading &&
              !ordersError &&
              orders.length > 0 && (
                <div className="admin-orders-list">
                  {orders.map((order) => (
                    <article
                      className="admin-order-card"
                      key={order._id}
                    >
                      <div className="admin-order-top">
                        <div>
                          <span className="admin-order-label">
                            ORDER ID
                          </span>

                          <h3>{order._id}</h3>

                          <p>
                            {formatOrderDate(order.createdAt)}
                          </p>
                        </div>

                        <span
                          className={`admin-payment-status ${
                            order.paymentStatus === "Paid"
                              ? "paid"
                              : "unpaid"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>

                      <div className="admin-order-details">
                        <div>
                          <span>Customer Mobile</span>
                          <strong>{order.mobile}</strong>
                        </div>

                        <div>
                          <span>Table Number</span>
                          <strong>{order.tableNumber}</strong>
                        </div>

                        <div>
                          <span>Payment Method</span>
                          <strong>{order.paymentMethod}</strong>
                        </div>

                        <div>
                          <span>Total Amount</span>
                          <strong>₹{order.totalAmount}</strong>
                        </div>
                      </div>

                      <div className="admin-order-items">
                        <h4>Ordered Items</h4>

                        {order.items.map((item) => (
                          <div
                            className="admin-order-item"
                            key={item._id || item.menuItemId}
                          >
                            <div>
                              <strong>{item.name}</strong>
                              <span>
                                ₹{item.price} × {item.quantity}
                              </span>
                            </div>

                            <strong>
                              ₹{item.price * item.quantity}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* CUSTOMER FEEDBACK SECTION */}
        {activeSection === "feedback" && (
          <div className="admin-feedback-section">
            <div className="admin-orders-header">
              <div>
                <h2>Customer Feedback</h2>
                <p>
                  Read reviews and ratings shared by your customers.
                </p>
              </div>

              <button
                className="admin-add-button"
                onClick={fetchFeedback}
                disabled={feedbackLoading}
              >
                {feedbackLoading
                  ? "Refreshing..."
                  : "↻ Refresh Feedback"}
              </button>
            </div>

            <div className="admin-orders-count">
              {feedbacks.length} Total Feedback
            </div>

            {feedbackLoading && (
              <p className="admin-menu-message">
                Loading customer feedback...
              </p>
            )}

            {feedbackError && (
              <p className="admin-menu-error">
                {feedbackError}
              </p>
            )}

            {!feedbackLoading &&
              !feedbackError &&
              feedbacks.length === 0 && (
                <div className="admin-menu-empty">
                  <span>✉</span>
                  <h3>No Feedback Found</h3>
                  <p>Customer feedback will appear here.</p>
                </div>
              )}

            {!feedbackLoading &&
              !feedbackError &&
              feedbacks.length > 0 && (
                <div className="admin-feedback-list">
                  {feedbacks.map((feedback) => (
                    <article
                      className="admin-feedback-card"
                      key={feedback._id}
                    >
                      <div className="admin-feedback-top">
                        <div>
                          <span className="admin-order-label">
                            CUSTOMER RATING
                          </span>

                          <div className="admin-feedback-stars">
                            {"★".repeat(feedback.rating)}
                            <span>
                              {"☆".repeat(5 - feedback.rating)}
                            </span>
                          </div>
                        </div>

                        <span className="admin-feedback-date">
                          {formatOrderDate(feedback.createdAt)}
                        </span>
                      </div>

                      <div className="admin-feedback-message">
                        <p>"{feedback.message}"</p>
                      </div>

                      <div className="admin-feedback-details">
                        <div>
                          <span>Customer Mobile</span>
                          <strong>
                            {feedback.orderId?.mobile || "Not available"}
                          </strong>
                        </div>

                        <div>
                          <span>Table Number</span>
                          <strong>
                            {feedback.orderId?.tableNumber || "Not available"}
                          </strong>
                        </div>

                        <div>
                          <span>Order Amount</span>
                          <strong>
                            {feedback.orderId?.totalAmount != null
                              ? `₹${feedback.orderId.totalAmount}`
                              : "Not available"}
                          </strong>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* DASHBOARD SECTION */}
        {activeSection === "dashboard" && (
          <div className="admin-dashboard-bottom">
            <h2>Quick Overview</h2>
            <p>
              Your café administration panel is ready.
              You can manage menu items and view customer orders
              using the sidebar.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
