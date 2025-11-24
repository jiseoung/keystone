const { verify } = require('../services/token.service');

const checkLogin = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const data = await verify(token);

        req.user = {
            id: data.id,
            age: data.age
        }

        return next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

module.exports = checkLogin;