const jwt = require("jsonwebtoken");
const User = require("../Model/UserModel");

const verifyToken = async (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Access Denied!" });
  }

  token = token.replace("Bearer ", "");
  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decode.id).select("id email role");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

module.exports = { verifyToken };
