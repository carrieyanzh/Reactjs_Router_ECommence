import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import styles from "./Profile.module.css";

function Address() {
  const [showForm, setShowForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingAddress, setEditingAddress] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/addresses");

      let dataPayload = [];
      if (Array.isArray(response.data)) {
        dataPayload = response.data;
      } else if (response.data && Array.isArray(response.data.addresses)) {
        dataPayload = response.data.addresses;
      }

      setAddresses(dataPayload);
    } catch (err) {
      console.error("Fetch address error:", err);
      setError("Unable to load or refresh your delivery address list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

    const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.target; // 1. Save reference immediately before async calls
    const formData = new FormData(formEl);

    const address = {
      phone: formData.get("phone"),
      addressLine1: formData.get("addressLine1"),
      addressLine2: formData.get("addressLine2"),
      postalCode: formData.get("postalCode"),
      city: formData.get("city"),
      country: formData.get("country"),
      addressType: formData.get("addressType"),
      isDefault: formData.get("isDefault") === "on",
    };

    setError("");
    setMessage("");

    try {
      if (editingAddress) {
        await api.put(`/api/addresses/${editingAddress.id}`, address);
        setMessage("Address updated successfully!");
      } else {
        await api.post("/api/addresses", address);
        setMessage("Address saved successfully!");
      }

      setShowForm(false);
      setEditingAddress(null);
      formEl.reset(); // 2. Use the saved reference to safely reset the inputs
      await fetchAddresses(); // 3. Triggers the re-render automatically
    } catch (err) {
      console.error("Save address error:", err);
      setError(err.response?.data?.message || "Unable to save address.");
    }
  };


    const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this address?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.delete(`/api/addresses/${id}`);
      setMessage("Address deleted successfully!");
      
      // Update state locally so the address card instantly disappears from the UI
      setAddresses((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete address error:", err);
      setError(err.response?.data?.message || "Unable to delete address.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "20px", color: "#666" }}>
        <h3>Access Restricted</h3>
        <p>Please log into your account dashboard profile to access shipping addresses.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Addresses</h2>
      
      {/* Mutually exclusive rendering blocks ensure only one tracking message shows at a time */}
      {message && <p className={styles.successMessage} style={{ color: "green" }}>{message}</p>}
      {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}
      
      <button
        className={styles.addAddressBtn}
        onClick={() => {
          // Clear operational alerts when shifting into input modes manually
          setError("");
          setMessage("");
          setShowForm(!showForm);
          setEditingAddress(null);
        }}
      >
        {showForm ? "Cancel Form" : "+ Add New Address"}
      </button>

      {showForm && (
        <div className={styles.addressForm}>
          <h3>{editingAddress ? "Edit Delivery Address" : "New Delivery Address"}</h3>
          <form onSubmit={handleSubmit} key={editingAddress ? editingAddress.id : "new"}>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              defaultValue={editingAddress?.phone || ""}
              required
            />
            <input
              type="text"
              name="addressLine1"
              placeholder="Address Line 1"
              defaultValue={editingAddress?.addressLine1 || editingAddress?.address_line1 || ""}
              required
            />
            <input
              type="text"
              name="addressLine2"
              placeholder="Address Line 2 (Optional)"
              defaultValue={editingAddress?.addressLine2 || editingAddress?.address_line2 || ""}
            />
            <input
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              defaultValue={editingAddress?.postalCode || editingAddress?.postal_code || ""}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              defaultValue={editingAddress?.city || "Singapore"}
              required
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              defaultValue={editingAddress?.country || "Singapore"}
              required
            />
            <select
              name="addressType"
              defaultValue={editingAddress?.addressType || editingAddress?.address_type || ""}
              required
            >
              <option value="">Select Address Type</option>
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isDefault"
                defaultChecked={editingAddress?.isDefault === true || editingAddress?.is_default === 1}
              />{" "}
              Set as default address
            </label>

            <div className={styles.formActions} style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <button
                type="submit"
                style={{ padding: "5px 12px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                {editingAddress ? "Update Address" : "Save Address"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                }}
                style={{ padding: "5px 12px", backgroundColor: "#95a5a6", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Saved Addresses Display Grid */}
      <div className={styles.savedAddressList} style={{ marginTop: "20px" }}>
        {loading && <p>Loading addresses...</p>}

        {!loading && addresses.length === 0 && (
          <p style={{ color: "#666" }}>No delivery addresses found. Click the button above to add one.</p>
        )}

        {!loading &&
          addresses.map((address) => {
            const displayType = address.addressType || address.address_type || "Address";
            const displayLine1 = address.addressLine1 || address.address_line1;
            const displayLine2 = address.addressLine2 || address.address_line2;
            const displayPostal = address.postalCode || address.postal_code;
            const isDefaultAddress = address.isDefault === true || address.isDefault === 1 || address.is_default === 1;

            return (
              <div
                className={styles.savedAaddress}
                key={address.id}
                style={{ border: "1px solid #eee", padding: "15px", borderRadius: "6px", marginBottom: "12px", position: "relative" }}
              >
                <h4>
                  {displayType}
                  {isDefaultAddress && <span style={{ color: "#e67e22", marginLeft: "8px" }}>⭐ Default</span>}
                </h4>
                <p><strong>Phone:</strong> {address.phone}</p>
                <p>{displayLine1}</p>
                {displayLine2 && <p>{displayLine2}</p>}
                <p>{address.city}, {displayPostal}</p>
                <p>{address.country}</p>

                <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      setError("");
                      setMessage("");
                      setEditingAddress(address);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{ padding: "5px 12px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  {/* Added Delete button structure here */}
                  <button
                    onClick={() => handleDelete(address.id)}
                    style={{ padding: "5px 12px", backgroundColor: "#e74c3c", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Address;
