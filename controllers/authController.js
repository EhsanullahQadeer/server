import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnAuthenticatedError } from "../errors/index.js";
import User from "../models/User.js";
import Writter from "../models/Writter.js";
import AdminModel from "../models/Admin.js";
import sendResetPassswordEmail from "../utils/sendResetPasswordEmail.js";
import createHash from "../utils/createHash.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { checkWriter, checkUser } from "../middleware/Checking.js";
import response from "../errors/response.js";
import notFound from "../errors/handling-requests.js";
import InternalServerError from "../errors/front/ServerError.js";

const overallAuth = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "You Are Authenticated" });
};

export const checkRole = async (req, res) => {
  const { userId } = req.body;
  let idValid = mongoose.isValidObjectId(userId);
  if (!idValid) {
    throw new BadRequestError("This is Invalid UserID !");
  }
  let currentWriter = await Writter.findOne({
    userId: userId,
    isApproved: true,
  }).select("_id isApproved");
  if (!currentWriter) {
    throw new BadRequestError("User Not Found !");
  } else {
    res.status(StatusCodes.OK).json(currentWriter);
  }
};

export async function checkActiveUser(req, res) {
  try {
    const { userId, writerId } = req.body;
    console.log(writerId);
    let user;
    if (writerId) {
      //true is used to return data
      user = await checkWriter(writerId, true);
    } else if (userId) {
      //true is used to return data
      user = await checkUser(userId, true);
    }
    if (!user) {
      return notFound(res, { msg: "User not found" });
    }
    if (user.writer) {
      user = await Writter.findOne({ userId: userId, isApproved: true });
    }

    response(res, user);
  } catch (error) {
    console.log(error);
    InternalServerError(res);
  }
}

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, categories, phoneNo } =
      req.body;
    const userAlreadyExists = await User.findOne({ email });
    if (
      !firstName ||
      !email ||
      !password ||
      !lastName ||
      !categories ||
      !phoneNo
    ) {
      res.status(StatusCodes.BAD_REQUEST).json({
        msg: "please provide all values",
      });
    } else if (userAlreadyExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Email already in use",
      });
    } else {
      var user = await User.create({
        firstName,
        email,
        password,
        lastName,
        categories,
        phoneNo,
      });
    }
    const token = user.createJWT();
    const userId = user._id;
    const role = user.role;
    const writer = user.writer;
    res.status(StatusCodes.OK).json({ token, userId, role, writer });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.toString(),
    });
  }
};
//
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestError("Please provide all values");
    }
    var user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new UnAuthenticatedError("Invalid Credentials!");
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnAuthenticatedError(" Invalid Credentials!");
    } else {
      const token = user.createJWT();
      const userId = user._id;
      const role = user.role;
      const writer = user.writer;
      res.status(StatusCodes.OK).json({ token, userId, role, writer });
    }
  } catch (error) {
    throw new BadRequestError("Invalid Credentials");
  }
};
//admin login
export const adminLogin = async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please Provide all the fields");
  }
  // AdminModel.create({
  //   email:"admin@gmail.com",
  //   password:"123456",
  // });
  var admin = await AdminModel.findOne({ email }).select("+password");
  if (!admin) {
    throw new UnAuthenticatedError("Invalid Credentials!");
  }
  const isPasswordCorrect = await admin.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError(" Invalid Credentials!");
  } else {
    const role = admin.role;
    const token = admin.createJWT();
    res.status(StatusCodes.OK).json({ token, role });
  }
};

const getCurrentUser = async (req, res) => {
  let currentUser = await User.findOne({ _id: req.user.userId });
  res.status(StatusCodes.OK).json({ user: currentUser });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Please provide  email");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new BadRequestError("This user does not exists in our system");
  }

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString("hex");
    // const origin = "http://127.0.0.1:5173";
    const origin = "https://blog-app-front.vercel.app";
    await sendResetPassswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: "Please check your email for reset password link" });
};

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ email });

  const currentDate = new Date();

  if (user.passwordToken !== createHash(token)) {
    throw new BadRequestError("Your Token Is Incorrect Please Try Again!");
  }

  if (user.passwordTokenExpirationDate < currentDate) {
    throw new BadRequestError("Sorry Your Token Is Expired Try Again!");
  }

  if (user) {
    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.status(StatusCodes.OK).json({ msg: "Password Reset Successfully!" });
};

export {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  overallAuth,
};
