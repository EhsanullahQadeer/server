import jwt from "jsonwebtoken";
import { UnAuthenticatedError, NotFoundError } from "../errors/index.js";
import WriterModel from "../models/Writter.js";
import { StatusCodes } from "http-status-codes";

const auth = async (req, res, next) => {
 
  const authHeader = req.headers.authorization ||req.body.headers.authorization;
  // console.log(authHeader.startsWith("Bearer"))

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    // if (!authHeader) {
    throw new UnAuthenticatedError("Authentication invalid");
  }
  const token = authHeader.split(" ")[1];
  console.log(token)
  // const token = authHeader;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.body = { ...req.body,...payload };
    next();
  } catch (error) {
    throw new UnAuthenticatedError("Authentication invalid");
  }
};

export const isWriterApproved = async (req, res, next) => {
  try {
    let currentWritter = await WriterModel.findOne({ userId: req.body.userId });
    if (!currentWritter) {
      throw new NotFoundError("The Writer Does Not Exists");
    }
    if (!currentWritter.isApproved) {
      throw new UnAuthenticatedError("You cannot access this route");
    }
    next();
  } catch (error) {
    throw new UnAuthenticatedError(error);
  }
};

export const authorizePermissions = (adminRole) => {
  return (req, res, next) => {
    const role=req.body.role;
    if (adminRole != role) {
      throw new UnAuthenticatedError("Unauthorized to access this route");
    }
    next();
  };
};

export default auth;
