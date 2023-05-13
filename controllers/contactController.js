import ContactModel from "../models/Contact.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/index.js";

export const createContact = async (req, res) => {
  let { name, email, contact, reason, message } = req.body;
  if (!name || !email || !contact || !reason || !message) {
    throw new BadRequestError("Please Provide all the fields");
  }
  let Contact = await ContactModel.create(req.body);
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Your message is dilivered successfully" });
};

// There must be a middleware for this that this route must be accessed by the admins of the app
export const getAllContactMessages = async (req, res) => {
  let AllContactMessages = await ContactModel.find({});
  res.status(StatusCodes.OK).json({ Contacts: AllContactMessages });
};
