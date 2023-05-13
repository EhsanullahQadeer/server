import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";
import {authorizePermissions } from "../middleware/auth.js";


import {
  register,
  login,
  adminLogin,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  overallAuth,
  checkRole
} from "../controllers/authController.js";
// this route is for overall authrntication
router.route("/overallAuth").post(auth,authorizePermissions("admin"),overallAuth);
//This route is for check role of user 
router.route("/checkRole").post(checkRole);

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/adminLogin").post(adminLogin);

router.route("/getCurrentUser").get(auth, getCurrentUser);
router.route("/forgetPassword").post(forgotPassword);
router.route("/resetPassword").post(resetPassword);
export default router;
