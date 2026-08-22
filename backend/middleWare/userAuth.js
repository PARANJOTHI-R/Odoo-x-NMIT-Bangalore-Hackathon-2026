import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    // Accept token from Authorization header (Bearer) or httpOnly cookie
    let token = null;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized. Please login again.'
        });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (!tokenDecode.id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Please login again.'
            });
        }

        req.user = {
            id:   tokenDecode.id,
            role: tokenDecode.role
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.'
        });
    }
};

export default userAuth;