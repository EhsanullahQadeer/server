import express from "express";
let router = express.Router();

import { Login } from "../controllers/GoogleAuth.js";

router.route("/googleLogin").post(Login);

export default router;
