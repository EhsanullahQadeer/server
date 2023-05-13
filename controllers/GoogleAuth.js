import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(
  "36805434232-210bfjp0a9rkvj96fj8f7dq6jgo8oahs.apps.googleusercontent.com"
);
import { BadRequestError } from "../errors/index.js";
import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";

const Login = async (req, res) => {
  let { idToken } = req.body;
  let data = await client.verifyIdToken({
    idToken,
    audience:
      "705164632277-vhv4q8ki9tntsbiv8n0do8l9rdbd1knk.apps.googleusercontent.com",
  });
  let { email, name, email_verified } = data.payload;

  if (email_verified) {
    let AlreadyExistsUser = await User.findOne({ email });

    if (AlreadyExistsUser) {
      const user = await User.findOne({ email }).select("+password");
      const token = user.createJWT();
      user.password = undefined;
      res.status(StatusCodes.OK).json({ user, token: token });
    } else {
      // const user = await User.create({
      //   firstName:name,
      //   lastName:name,
      //   email,
      //   password: "2cesqxue",
      //   phoneNo:"123",
      //   categories:"Technology"
      // });
      // const token = user.createJWT();
      // res.status(StatusCodes.CREATED).json({
      //   user: user,
      //   token: token,
      // });

      throw new BadRequestError("Please Register First To Login");
      // res.status(StatusCodes.OK).json({msg:"Error Occured"})
    }

    res.status(StatusCodes.OK).json({ msg: "Success" });
  }
};

export { Login };
