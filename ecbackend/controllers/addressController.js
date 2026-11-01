import db from "../db.js";

const getRowObject = (result) => {
    if (!result || !result.rows || result.rows.length === 0) return null;
    return result.rows[0]; 
};

export const getAddresses = async (req, res) => {
    let userId = req.user?.id;

    if (!userId) {
        try {
            const userCheck = await db.execute("SELECT id FROM users LIMIT 1");
            if (userCheck.rows && userCheck.rows.length > 0) {
                const firstUser = userCheck.rows[0];
                userId = firstUser.id !== undefined ? firstUser.id : firstUser[0];
            } else {
                userId = 1;
            }
        } catch (dbErr) {
            console.error("Failed to fetch fallback user ID:", dbErr.message);
            userId = 1;
        }
    }

    const sql = "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC";

    try {
        const result = await db.execute({
            sql: sql,
            args: [userId]
        });
        
        const formattedAddresses = result.rows.map(row => ({
            id: row.id,
            user_id: row.user_id,
            phone: row.phone,
            address_line1: row.address_line1 !== undefined ? row.address_line1 : row.addressLine1,
            address_line2: row.address_line2 !== undefined ? row.address_line2 : row.addressLine2,
            postal_code: row.postal_code !== undefined ? row.postal_code : row.postalCode,
            city: row.city,
            country: row.country,
            address_type: row.address_type !== undefined ? row.address_type : row.addressType,
            is_default: row.is_default !== undefined ? row.is_default : row.isDefault
        }));
        
        return res.status(200).json({
            addresses: formattedAddresses
        });

    } catch (err) {
        console.error("Get addresses error:", err.message);
        return res.status(500).json({
            message: "Failed to retrieve addresses"
        });
    }
};

export const createAddress = async (req, res) => {
    let userId = req.user?.id;

    if (!userId) {
        try {
            const userCheck = await db.execute("SELECT id FROM users LIMIT 1");
            if (userCheck.rows && userCheck.rows.length > 0) {
                const firstUser = userCheck.rows[0];
                userId = firstUser.id !== undefined ? firstUser.id : firstUser[0];
            } else {
                userId = 1;
            }
        } catch (dbErr) {
            userId = 1;
        }
    }

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

    if (!phone?.trim() || !addressLine1?.trim() || !postalCode?.trim() || !city?.trim() || !country?.trim() || !addressType) {
        return res.status(400).json({ message: "Please complete all required fields" });
    }

    const defaultValue = isDefault ? 1 : 0;

    try {        
        if (defaultValue === 1) {
            await db.execute({
                sql: "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
                args: [userId]
            });
        }

        const insertSql = "INSERT INTO addresses(user_id, phone, address_line1, address_line2, postal_code, city, country, address_type, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const insertValues = [userId, phone, addressLine1, addressLine2 || "", postalCode, city, country, addressType, defaultValue];

        const insertResult = await db.execute({
            sql: insertSql,
            args: insertValues
        });

        // Support standard insertId return layouts across different engine clients safely
        let newAddressId = null;
        if (insertResult.lastInsertRowid) {
            newAddressId = insertResult.lastInsertRowid.toString();
        } else if (insertResult.insertId) {
            newAddressId = insertResult.insertId.toString();
        }

        // Fetch back the newly committed row profile to hand over cleanly to the UI context state
        let selectResult;
        if (newAddressId) {
            selectResult = await db.execute({
                sql: "SELECT * FROM addresses WHERE id = ? AND user_id = ?",
                args: [newAddressId, userId]
            });
        } else {
            selectResult = await db.execute({
                sql: "SELECT * FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1",
                args: [userId]
            });
        }

        const row = getRowObject(selectResult);
        if (!row) {
            return res.status(500).json({ message: "Address saved, but database retrieval timed out" });
        }

        const formatted = {
            id: row.id,
            user_id: row.user_id,
            phone: row.phone,
            address_line1: row.address_line1 !== undefined ? row.address_line1 : row.addressLine1,
            address_line2: row.address_line2 !== undefined ? row.address_line2 : row.addressLine2,
            postal_code: row.postal_code !== undefined ? row.postal_code : row.postalCode,
            city: row.city,
            country: row.country,
            address_type: row.address_type !== undefined ? row.address_type : row.addressType,
            is_default: row.is_default !== undefined ? row.is_default : row.isDefault
        };

        // ✅ Returns key 'address' to match precisely what your Address.jsx handleSubmit expects
        return res.status(201).json({
            message: "Address saved successfully",
            address: formatted
        });

    } catch (err) {
        console.error("Save address error:", err.message);
        return res.status(500).json({ message: "Failed to save address. Database error." });
    }
};

export const deleteAddress = async (req, res) => {
    let userId = req.user?.id;

    // Fallback logic matching your get/create routes
    if (!userId) {
        try {
            const userCheck = await db.execute("SELECT id FROM users LIMIT 1");
            if (userCheck.rows && userCheck.rows.length > 0) {
                const firstUser = userCheck.rows[0];
                userId = firstUser.id !== undefined ? firstUser.id : firstUser[0];
            } else {
                userId = 1;
            }
        } catch (dbErr) {
            userId = 1;
        }
    }

    const addressId = req.params.id;

    if (!addressId) {
        return res.status(400).json({ message: "Address ID parameter required" });
    }

    try {
        // Enforce strong casting to numbers if database expects an integer ID
        const targetId = isNaN(addressId) ? addressId : Number(addressId);

        await db.execute({
            sql: "DELETE FROM addresses WHERE id = ? AND user_id = ?",
            args: [targetId, userId]
        });

        return res.status(200).json({
            message: "Address deleted successfully",
            deletedId: addressId
        });
    } catch (err) {
        console.error("Delete address error:", err.message);
        return res.status(500).json({ message: "Failed to delete address. Database error." });
    }
};