import express from "express";
import { getProfileController, loginController, register, veryifyMailController } from "../controllers/user.controller.js";
import isLoggedInMiddleware from "../middlewares/isLoggedin.middleware.js";


const router = express.Router();

//router.get("/register",register)

router.route("/register").post(register);
router.route("/verify/:token").get(veryifyMailController);
router.route("/login").get(loginController);
router.route("/getProfile").get(isLoggedInMiddleware,getProfileController);


export default router;