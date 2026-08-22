const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: No user role found"
            });
        }

        if (req.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Requires ${role} role`
            });
        }

        next();
    };
};

export default requireRole;
