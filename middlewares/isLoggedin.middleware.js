import jwt from "jsonwebtoken";


const isLoggedInMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization 
    const accessToken = token.split(" ")[1] || req.cookies.jwtToken;
    console.log('access',accessToken)
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Token Invalid",
      });
    }
    const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      success: false,
      message: "Unauthorized / Internal server error",
    });
  }
};

export default isLoggedInMiddleware
