const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // get the token from header
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ mesg: "No token, Autherisation denied" });
  }

  //verified token
  try {
    const decoded = jwt.verify(token, config.get("jwtToken"));
    console.log("decode", decoded);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ mesg: "Token is not valid" });
  }
};
