import db from "../db.js";

export const getAddresses = (req, res) => {
  const userId = req.user.id;

  const sql = `
  SELECT *
  FROM addresses
  WHERE user_id = ?
  ORDER BY is_default DESC, id DESC`;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Get addresses error:", err.message);

      return res.status(500).json({
        message: "Failed to retrieve addresses"
      });
    }

    res.status(200).json({
      addresses: rows
    });

  });
};


// POST: Save new address
export const createAddress = (req, res) => {
  const userId = req.user.id;

  const {
    phone,
    addressLine1,
    addressLine2,
    postalCode,
    city,
    country,
    addressType,
    isDefault
  } = req.body;

  // Validate required fields
  if (
    !phone?.trim() ||
    !addressLine1?.trim() ||
    !postalCode?.trim() ||
    !city?.trim() ||
    !country?.trim() ||
    !addressType
  ) {
    return res.status(400).json({
      message: "Please complete all required fields"
    });
  }

  const defaultValue = isDefault ? 1 : 0;

  const insertAddress = () => {

   const sql = `
  INSERT INTO addresses(
    user_id,    
    phone,
    address_line1,
    address_line2,
    postal_code,
    city,
    country,
    address_type,
    is_default
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const values = [
  userId,
  phone,
  addressLine1,
  addressLine2 || "",
  postalCode,
  city,
  country,
  addressType,
  defaultValue
];

    db.run(sql, values, function (err) {

      if (err) {
        console.error("Insert address error:", err.message);

        return res.status(500).json({
          message: "Failed to save address"
        });
      }

      const newAddressId = this.lastID;

      db.get(
        `SELECT * FROM addresses
         WHERE id = ? AND user_id = ?`,
        [newAddressId, userId],
        (selectErr, row) => {

          if (selectErr) {
            console.error(selectErr.message);

            return res.status(500).json({
              message: "Address saved, but retrieval failed"
            });
          }

          return res.status(201).json({
            message: "Address saved successfully",
            address: row
          });

        }
      );

    });

  };

  if (defaultValue === 1) {

    db.run(
      `UPDATE addresses
       SET is_default = 0
       WHERE user_id = ?`,
      [userId],
      (err) => {

        if (err) {
          console.error(err.message);

          return res.status(500).json({
            message: "Failed to update default address"
          });
        }

        insertAddress();

      }
    );

  } else {

    insertAddress();

  }

};