import express from "express";
import { register } from "../controllers/user.controller.js";

const router = express.Router();

//router.get("/register",register)

router.route("/register").get(register);

export default router;