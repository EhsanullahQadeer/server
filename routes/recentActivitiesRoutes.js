import {
  getRecentlyViewedBlogs,
  addBookmark,
  removeBookmark,
  getBookmark,
  singleBookmarkStatus
} from "../controllers/recentActivities.js";
import { Router } from "express";
let router = Router();

router.route("/getRecentlyViewedBlogs/:userId").get(getRecentlyViewedBlogs);
router.route("/addBookmark/:blogId/:userId").post(addBookmark);
router.route("/removeBookmark/:blogId/:userId").post(removeBookmark);
router.route("/getBookmark/:userId").get(getBookmark);
router.route("/singleBookmarkStatus/:blogId").get(singleBookmarkStatus);


export default router;
