import { useState, useEffect } from "react";
import api from "../api/api";
import "./Address.css";

function Address() {
  const [showForm, setShowForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/addresses");
      setAddresses(response.data.addresses);
      setError("");
    } catch (err) {
      console.error("Fetch address error:", err);
      setError(        
         "Address saved, but unable to refresh the address list."
      );
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAddresses();
  }, []);

  // POST: Save address into SQLite
  const handleSubmit = async (e) => {

    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const address = {

      phone: formData.get("phone"),

      addressLine1: formData.get("addressLine1"),

      addressLine2: formData.get("addressLine2"),

      postalCode: formData.get("postalCode"),

      city: formData.get("city"),

      country: formData.get("country"),

      addressType: formData.get("addressType"),

      isDefault: formData.get("isDefault") === "on"

    };

    try {
      setError("");
      setMessage("");
      
      const response = await api.post(
        "/addresses",
        address
      );
      console.log("Saved address:", response.data.address);

      // Refresh address list from SQLite
      //
      setShowForm(false);
      setMessage("Address saved successfully!");
      //e.currentTarget.reset();
      await fetchAddresses();
    } catch (err) {

      console.error("Save address error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to save address."
      );
    }
  };

  return (
    <div >
      <h2>Addresses</h2>

      {/* Success message */}
      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {/* Add New Address Button */}
      <button
        className="add-address-btn"
        onClick={() => setShowForm(!showForm)}
      >
        + Add New Address
      </button>

      {/* Address Form */}
      {showForm && (

        <div className="address-form">

          <h3>New Delivery Address</h3>

          <form onSubmit={handleSubmit}>

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
            />

            <input
              type="text"
              name="addressLine1"
              placeholder="Address Line 1"
              required
            />

            <input
              type="text"
              name="addressLine2"
              placeholder="Address Line 2 (Optional)"
            />

            <input
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              required
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              defaultValue="Singapore"
              required
            />

            <input
              type="text"
              name="country"
              placeholder="Country"
              defaultValue="Singapore"
              required
            />

            <select
              name="addressType"
              required
            >

              <option value="">
                Select Address Type
              </option>

              <option value="Home">Home</option>

              <option value="Office">Office</option>

              <option value="Other">Other</option>

            </select>

            <label>

              <input
                type="checkbox"
                name="isDefault"
              />

              Set as default address

            </label>

            <button type="submit">
              Save Address
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

          </form>

        </div>

      )}

      {/* Saved Addresses - Always visible outside the form */}
      <div className="saved-address-list">
        <h3></h3>
        {loading && <p>Loading addresses...</p>}

        {!loading && addresses.length === 0 && (
          <p>No delivery addresses found.</p>
        )}

        {!loading && addresses.map((address) => (

          <div
            className="saved-address"
            key={address.id}
          >

            <h4>
              {address.address_type}
              {address.is_default === 1 && " ⭐ Default"}
            </h4>

            <p>Phone: {address.phone}</p>

            <p>{address.address_line1}</p>

            {address.address_line2 && (
              <p>{address.address_line2}</p>
            )}

            <p>
              {address.city}, {address.postal_code}
            </p>

            <p>{address.country}</p>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Address;