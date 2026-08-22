import { findUserById } from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await findUserById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.is_acc_verified,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Get user data error:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};