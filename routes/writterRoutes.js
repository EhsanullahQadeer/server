import express from "express";

let router = express.Router();

import {
  createWritter,
  getAllApprovedWritters,
  getAllWritterRequests,
  ApproveWritter,
  rejectRequests,
  getSingleWritter,
  getCurrentWritter,
  updateWriter,
  DisapproveWritter,
  getAllDisapprovedWritters,
  getAllRejectedRequests
} from "../controllers/writterController.js";

import { authorizePermissions } from "../middleware/auth.js";
import auth from "../middleware/auth.js";

router.route("/").post(auth, createWritter);

router.route("/currentWritter").get(auth, getCurrentWritter);

router.route("/updateWriter/:writerId").post(auth, updateWriter);
// router.route("/:writerId").get(getSingleWritter);


// Below we need to add the middelware for the admins
              //  Display Data
router.route("/approvedWriters").get(auth,authorizePermissions("admin"),getAllApprovedWritters);
router.route("/writersRequests").get(auth,authorizePermissions("admin"),getAllWritterRequests);
router.route("/disapprovedWritters").get(auth,authorizePermissions("admin"),getAllDisapprovedWritters);
router.route("/rejectedRequests").get(auth,authorizePermissions("admin"),getAllRejectedRequests);

              // Actions on Data
// router.route("/approveWriter/:writerId").post(auth, authorizePermissions("user"), ApproveWritter);
router.route("/approveWriter/:writerId").post(auth,authorizePermissions("admin"),ApproveWritter);
router.route("/disapproveWriter/:writerId").post(auth,authorizePermissions("admin"),DisapproveWritter);
router.route("/rejectRequests/:writerId").post(auth,authorizePermissions("admin"),rejectRequests);




export default router;