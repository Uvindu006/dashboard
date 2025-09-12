const pool = require('../../../../db/db.js');
const bcrypt = require('bcrypt');

// Get all organizers
const getOrganizers = async (req, res) => {
    try {
        const result = await pool.query("SELECT organizer_ID, organizer_name, Fname, Lname, email, contact_no FROM Organizer WHERE status = 'approved' ORDER BY organizer_ID");
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching Organizers:', err.message);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

// Get a single organizer by ID
const getOrganizerById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT organizer_ID, organizer_name, Fname, Lname, email, contact_no FROM Organizer WHERE organizer_ID = $1 AND status = 'approved'", [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Approved organizer not found' });
        }
    } catch (err) {
        console.error('Error fetching Organizer by ID:', err.message);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

// Update an organizer
const updateOrganizer = async (req, res) => {
    const { id } = req.params;
    const { organizer_name, Fname, Lname, email, contact_no, password } = req.body;

    // Validate required fields
    if (!organizer_name && !Fname && !Lname && !email && !contact_no && !password) {
        return res.status(400).json({ message: 'At least one field must be provided for update' });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    let hashedPassword = undefined;
    if (password) {
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (err) {
            console.error('Error hashing password:', err.message);
            return res.status(500).json({ message: 'Error hashing password', error: err.message });
        }
    }

    try {
        // First check if organizer exists and is approved
        const checkResult = await pool.query(
            "SELECT organizer_ID FROM Organizer WHERE organizer_ID = $1 AND status = 'approved'",
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Approved organizer not found' });
        }

        const result = await pool.query(
            `UPDATE Organizer
                SET organizer_name = COALESCE($1, organizer_name),
                Fname          = COALESCE($2, Fname),
                Lname          = COALESCE($3, Lname),
                email          = COALESCE($4, email),
                contact_no     = COALESCE($5, contact_no),
                password_hash  = COALESCE($6, password_hash)
                WHERE organizer_ID = $7 AND status = 'approved'
                RETURNING organizer_ID, organizer_name, Fname, Lname, email, contact_no`,
            [organizer_name, Fname, Lname, email, contact_no, hashedPassword, id]
        );
        
        if (result.rows.length > 0) {
            res.json({ message: 'Organizer updated successfully', organizer: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Organizer not found or not approved' });
        }
    } catch (err) {
        console.error('Error updating Organizer:', err.message);
        
        // Handle specific database errors
        if (err.code === '23505') { // Unique constraint violation
            res.status(409).json({ message: 'Email already exists', error: err.message });
        } else if (err.code === '23503') { // Foreign key constraint violation
            res.status(409).json({ message: 'Cannot update organizer due to related records', error: err.message });
        } else if (err.code === '23514') { // Check constraint violation
            res.status(400).json({ message: 'Data validation failed', error: err.message });
        } else {
            res.status(500).json({ message: 'Database error', error: err.message });
        }
    }
};

// Delete an organizer (soft delete by changing status)
const deleteOrganizer = async (req, res) => {
    const { id } = req.params;
    
    try {
        // First check if organizer exists and is approved
        const checkResult = await pool.query(
            "SELECT organizer_ID FROM Organizer WHERE organizer_ID = $1 AND status = 'approved'",
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Approved organizer not found' });
        }

        // Check for related records that might prevent deletion
        const relatedEvents = await pool.query(
            "SELECT COUNT(*) as count FROM Events WHERE organizer_ID = $1",
            [id]
        );

        const relatedBuildings = await pool.query(
            "SELECT COUNT(*) as count FROM Buildings WHERE organizer_ID = $1",
            [id]
        );

        if (relatedEvents.rows[0].count > 0 || relatedBuildings.rows[0].count > 0) {
            return res.status(409).json({ 
                message: 'Cannot delete organizer with associated events or buildings. Consider deactivating instead.',
                details: {
                    events: parseInt(relatedEvents.rows[0].count),
                    buildings: parseInt(relatedBuildings.rows[0].count)
                }
            });
        }

        // Perform soft delete by changing status to 'deleted'
        const result = await pool.query(
            `UPDATE Organizer 
             SET status = 'deleted', 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE organizer_ID = $1 AND status = 'approved'
             RETURNING organizer_ID, organizer_name, Fname, Lname, email, contact_no`,
            [id]
        );

        if (result.rows.length > 0) {
            res.json({ 
                message: 'Organizer deleted successfully', 
                organizer: result.rows[0] 
            });
        } else {
            res.status(404).json({ message: 'Organizer not found or already deleted' });
        }
    } catch (err) {
        console.error('Error deleting Organizer:', err.message);
        
        // Handle specific database errors
        if (err.code === '23503') { // Foreign key constraint violation
            res.status(409).json({ 
                message: 'Cannot delete organizer due to foreign key constraints. Related records exist.',
                error: err.message 
            });
        } else {
            res.status(500).json({ message: 'Database error', error: err.message });
        }
    }
};

// Hard delete an organizer (use with caution)
const hardDeleteOrganizer = async (req, res) => {
    const { id } = req.params;
    
    try {
        // First check if organizer exists
        const checkResult = await pool.query(
            "SELECT organizer_ID FROM Organizer WHERE organizer_ID = $1",
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Organizer not found' });
        }

        // Check for related records
        const relatedEvents = await pool.query(
            "SELECT COUNT(*) as count FROM Events WHERE organizer_ID = $1",
            [id]
        );

        const relatedBuildings = await pool.query(
            "SELECT COUNT(*) as count FROM Buildings WHERE organizer_ID = $1",
            [id]
        );

        if (relatedEvents.rows[0].count > 0 || relatedBuildings.rows[0].count > 0) {
            return res.status(409).json({ 
                message: 'Cannot delete organizer with associated events or buildings',
                details: {
                    events: parseInt(relatedEvents.rows[0].count),
                    buildings: parseInt(relatedBuildings.rows[0].count)
                }
            });
        }

        const result = await pool.query(
            'DELETE FROM Organizer WHERE organizer_ID = $1 RETURNING organizer_ID, organizer_name, Fname, Lname, email, contact_no',
            [id]
        );

        if (result.rows.length > 0) {
            res.json({ 
                message: 'Organizer permanently deleted', 
                organizer: result.rows[0] 
            });
        } else {
            res.status(404).json({ message: 'Organizer not found' });
        }
    } catch (err) {
        console.error('Error hard deleting Organizer:', err.message);
        
        if (err.code === '23503') { // Foreign key constraint violation
            res.status(409).json({ 
                message: 'Cannot delete organizer due to foreign key constraints',
                error: err.message 
            });
        } else {
            res.status(500).json({ message: 'Database error', error: err.message });
        }
    }
};

// Deactivate an organizer (alternative to deletion)
const deactivateOrganizer = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            `UPDATE Organizer 
             SET status = 'inactive', 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE organizer_ID = $1 AND status = 'approved'
             RETURNING organizer_ID, organizer_name, Fname, Lname, email, contact_no`,
            [id]
        );

        if (result.rows.length > 0) {
            res.json({ 
                message: 'Organizer deactivated successfully', 
                organizer: result.rows[0] 
            });
        } else {
            res.status(404).json({ message: 'Approved organizer not found' });
        }
    } catch (err) {
        console.error('Error deactivating Organizer:', err.message);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

module.exports = {
    getOrganizers,
    getOrganizerById,
    updateOrganizer,
    deleteOrganizer,
    hardDeleteOrganizer,
    deactivateOrganizer
};
