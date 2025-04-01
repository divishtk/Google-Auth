import user from "../models/user.models.js";
import crypto from "crypto";
import sendMailVerification from "../utils/sendmail.utils.js";
import jwt from "jsonwebtoken";

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
    const tokenExpiry =  Date.now() + 10 * 60 * 60 * 1000; // 10 hours from now

    const newUser = await user.create({
      name,
      email,
      password,
      verificationToken: token,
      verificationTokenExpiry: tokenExpiry,
    });

    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong while creating user",
      });
    }

    await newUser.save();
    await sendMailVerification(email, token);
    return res.status(201).json({
      success: true,
      message: "User registered successfully, please verify mail",
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

const veryifyMailController = async (req, res) => {
  try {
    const { token } = req.params;
    console.log(token);
    const users = await user.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });


    if (!users) {
      return res.status(400).json({
        success: false,
        message: "Invalid token or verification token expired",
      });
    }
    users.isVerified = true;
    users.verificationToken = undefined;
    users.verificationTokenExpiry = undefined;
    await users.save();
    return res.status(200).json({
      success: true,
      message: "User Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while verification",
    });
  }
};

const loginController = async (req, res) => {
 try {
     const { email, password } = req.body;
     if (!email || !password) {
       return res.status(400).json({
         success: false,
         message: "Please fill all fields",
       });
     }
   
     const users = await user.findOne({ email });
     if (!users) {
       return res.status(400).json({
         success: false,
         message: "User not found",
       });
     }
   
     if (!users.isVerified) {
       return res.status(400).json({
         success: false,
         message: "Please verify your email",
       });
     }

   
     const isPasswordMatch = await users.comparePassword(password);

     if (!isPasswordMatch) {
       return res.status(400).json({
         success: false,
         message: "Invalid Password",
       });
     }
   
     //jwt token generation
     const jwtToken = jwt.sign(
       {
         id: users._id,
       },
       process.env.JWT_TOKEN_SECRET,
       {
         expiresIn: "15m",
       }
     );
   
     const cookieOptions = {
       expiresIn: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
       httpOnly: true, //XSS attacks
     };
   
     res.cookie("jwtToken", jwtToken, cookieOptions);
   
     return res.status(200).json({
       success: true,
       message: "Login successful",
       data: {
         users,
         token: jwtToken,
       },
     });
 } catch (error) {
     console.error(error);
     return res.status(500).json({
       success: false,
       message: "Some error occurred while login",
     });
    
 }
};

export { register, veryifyMailController ,loginController};
