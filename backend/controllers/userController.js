const User = require('../models/User');

// Update user details (excluding treatment-related fields)
const updateUserDetails = async (req, res) => {
    try {
        console.log("Session User:", req.session);

        const userId = req.headers['x-user-id'] || req.session.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        console.log("Update Payload:", req.body);

        const updateFields = req.body; // Capture incoming fields
        updateFields.details_filled = true; // Ensure this field is set

        // Update user details
        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User details updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Get current user details
const getUserDetails = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || req.session.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        // Fetch user details (excluding password)
        const user = await User.findById(userId).select('-password -_id -name -email -details_filled -createdAt -updatedAt -__v');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { updateUserDetails, getUserDetails };
