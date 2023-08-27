import {
  getRecentlyViewedBlogs,
  addBookmark,
  removeBookmark,
  getBookmark,
  getQuickStats,
} from "../controllers/recentActivities.js";
import auth from "../middleware/auth.js";
import { Router } from "express";
let router = Router();

router.route("/getRecentlyViewedBlogs/:userId").get(getRecentlyViewedBlogs);
router.route("/addBookmark/:blogId").post(auth, addBookmark);
router.route("/removeBookmark/:blogId").post(auth, removeBookmark);
router.route("/getBookmark/:userId?").get(getBookmark);
router.route("/getQuickStats").get(getQuickStats);

export default router;
