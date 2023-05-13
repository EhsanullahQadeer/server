import express from "express";
let router = express.Router();

import {
  createContact,
  getAllContactMessages,
} from "../controllers/contactController.js";

import { authorizePermissions } from "../middleware/auth.js";
import auth from "../middleware/auth.js";

router
  .route("/")
  .post(createContact)
  .get(auth, authorizePermissions("admin"), getAllContactMessages);

export default router;
