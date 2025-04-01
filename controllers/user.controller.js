import user from "../models/user.models.js";
import crypto from "crypto";

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
  
    if ([!name || !email || !password].some((field) => field === "")) {
      // Check if any field is empty
      // If any field is empty, return a 400 status code with a message
      // indicating that all fields are required
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }
  
    if (password < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }
  
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
  
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date.now() + 10 * 60 * 60 * 1000; // 10 hours from now
  
    const newUser = await user.create({
      name,
      email,
      password,
      verificationToken: token,
      verificationTokenExpiry: tokenExpiry,
    });
  
    if (!newUser) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong while creating user" });
    }
  
    await newUser.save();
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        data: newUser,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    
  }
};

export { register };
