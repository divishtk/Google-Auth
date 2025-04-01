import express from "express";
import { loginController, register, veryifyMailController } from "../controllers/user.controller.js";

const router = express.Router();

//router.get("/register",register)

router.route("/register").post(register);
router.route("/verify/:token").get(veryifyMailController);
router.route("/login").get(loginController);

export default router;