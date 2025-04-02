import jwt from "jsonwebtoken";
import user from "../models/user.models.js";

const isLoggedInMiddleware = async (req, res, next) => {
  try {
console.log("1")
    const accessToken =  req.cookies.jwtToken;
    const refreshToken = req.cookies.rfToken;

    console.log('refresh', refreshToken)

    if (!accessToken) {
      console.log("2")

      if (!refreshToken) {
        console.log("3")

        return res.status(401).json({
          success: false,
          message: "Unauthorized Access, login again!",
        });
      }
      console.log("4")
      const refreshDecoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const userData = await user.findById({ _id: refreshDecoded.id });

      if (!userData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized Access!!",
        });
      }

      const newAccessToken = jwt.sign(
        { id: userData._id },
        process.env.JWT_TOKEN_SECRET,
        { expiresIn: process.env.JWT_TOKEN_EXPIRY }
      );
      const newRefreshToken = jwt.sign(
        { id: userData._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
      );
      userData.refreshToken = newRefreshToken;
      await userData.save();

      const cookieOptions = {
        httpOnly: true,
      };
      res.cookie("newRefreshToken", newRefreshToken, cookieOptions);
      res.cookie("newAccessToken", newAccessToken, cookieOptions);
      req.user = refreshDecoded;
      next();
    } else {
      console.log("5")
      const accessDecoded = jwt.verify(
        accessToken,
        process.env.JWT_TOKEN_SECRET
      );

      const userData = await user.findById({ _id: accessDecoded.id });
      if (!userData) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized Access!!",
        });
      }
      const newAccessToken = jwt.sign(
        { id: userData._id },
        process.env.JWT_TOKEN_SECRET,
        { expiresIn: process.env.JWT_TOKEN_EXPIRY }
      );

      const newRefreshToken = jwt.sign(
        { id: userData._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
      );
      userData.refreshToken = newRefreshToken;
      await userData.save();
      const cookieOptions = {
        httpOnly: true,
      };
      res.cookie("newRefreshToken", newRefreshToken, cookieOptions);
      res.cookie("newAccessToken", newAccessToken, cookieOptions);
      req.user = accessDecoded;
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export default isLoggedInMiddleware;
