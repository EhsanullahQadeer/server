import WritterModel from "../models/Writter.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/index.js";
import User from "../models/User.js";
import mongoose from "mongoose";
// English.
export const createWritter = async (req, res) => {
  let {
    age,
    city,
    province,
    country,
    qualifications,
    designation,
    purpose,
  } = req.body.data;
  const {userId}=req.body;
  if (
    !age ||
    !city ||
    !country ||
    !province ||
    !qualifications ||
    !purpose
  ) {
    throw new BadRequestError("Please Provide all the fields");
  }
  
  let alreadyWriter = await WritterModel.findOne({ userId: userId });
  if (alreadyWriter) {
    if(alreadyWriter.isApproved==true){
      throw new BadRequestError("You are already approved writer!");
    }else {
      throw new BadRequestError(
        "You already have subbmited request for the writer"
      );
    }
  }

  //taking email and name from  already registerd user model by userID from taking from auth token
  let user = await User.findOne({ _id: userId});
const data={
  firstName:user.firstName,
  lastName:user.lastName,
  name:user.firstName+" "+user.lastName,
  email:user.email,
  phoneNo:user. phoneNo,
  userId:user._id.toString()
  ,...req.body.data
}
  let writer = await WritterModel.create(data);
  res.status(StatusCodes.CREATED).json({
    msg: "Your request to become writter is submited successfully",
  });
};



// This is route must be accessed by the admins only Here Displays the all wriiters who requested to become the writter
export const getAllWritterRequests = async (req, res) => {
  let Writters = await WritterModel.find({ isApproved: false,isDisapproved:false,isRejected:false});
  res.status(StatusCodes.OK).json({ Writters });
};

// Here Comes all the writters which are approved by the admins
export const getAllApprovedWritters = async (req, res) => {
  let ApprovedWritters = await WritterModel.find({ isApproved: true });
  res.status(StatusCodes.OK).json({ ApprovedWritters });
};
// Display wriiters disapproved by the admin
export const getAllDisapprovedWritters = async (req, res) => {
  let DissapprovedWritters = await WritterModel.find({ isApproved: false,isDisapproved:true });
  res.status(StatusCodes.OK).json({ DissapprovedWritters });
};
// Display requests Rejected by the admin
export const getAllRejectedRequests = async (req, res) => {
  let rejectedRequests= await WritterModel.find({ isApproved: false,isRejected:true});
  res.status(StatusCodes.OK).json({ rejectedRequests });
};

// This Route is also accessed by the admins only Here the admin see a particular writter who requested to become writter then they approve them to become writter
export const ApproveWritter = async (req, res) => {
   let { writerId } = req.params;
   let idValid= mongoose.isValidObjectId(writerId);
   if(!idValid){
    throw new BadRequestError("This is Invalid WritterID");
  }
  let writer = await WritterModel.findOne({ _id: writerId, isApproved: false });
  if (!writer) {
    throw new BadRequestError("This is Invalid WritterID");
  }
  writer.isApproved = true;
  await writer.save();

  //taking userId from writer model which we take from token  during writer request and then stored in writer model
  const userId = writer.userId;
  //update writer to true in user model
  let user = await User.findOne({ _id: userId});
  user.writer = true;
  user.role="writter";
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Writter Approved Successfully" });
};

//The admin can disapprove the writer if he is already approve
export const DisapproveWritter=async(req,res)=>{
  let{writerId}=req.params;
  let idValid= mongoose.isValidObjectId(writerId);
  if(!idValid){
    throw new BadRequestError("This is Invalid Writter ID !");
  }
  let writer = await WritterModel.findOne({_id: writerId,isApproved:true});

  if(!writer){
    throw new BadRequestError("Writter not found !");
  }
  writer.isApproved = false;
  writer.isDisapproved=true;
  await writer.save();
  
  const userId = writer.userId;
  //update writer to false in user model
  let user = await User.findOne({ _id: userId});
  user.writer = false;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Writter Dissapproved Successfully" });
}


//reject writter requests
export const rejectRequests=async(req,res)=>{
  let{writerId}=req.params;
  let idValid= mongoose.isValidObjectId(writerId);
  if(!idValid){
    throw new BadRequestError("This is Invalid WritterID");
  }
  let writer = await WritterModel.findOne({_id: writerId,isApproved:false,isDisapproved:false});

  if(!writer){
    throw new BadRequestError("Writter not found !");
  }
  writer.isRejected = true;
  await writer.save();
  res.status(StatusCodes.OK).json({ msg: "Request Rejected Successfully" });
}








export const getSingleWritter = async (req, res) => {
  let { writerId } = req.params;
  let Writter = await WritterModel.findOne({ _id: writerId });
  if (!Writter) {
    throw new BadRequestError("This is Invalid WritterID");
  }
  res.status(StatusCodes.OK).json({ Writter });
};



export const getCurrentWritter = async (req, res) => {
const userId=req.body.userId;
  let idValid= mongoose.isValidObjectId(userId);
  if(!idValid){
    throw new BadRequestError("This is Invalid WritterID");
  }
  let currentWriter = await WritterModel.findOne({ userId:userId});
  if (!currentWriter) {
    throw new BadRequestError("This Writter Does Not Exists");
  }
  res.status(StatusCodes.OK).json({ currentWriter });
};



export const updateWriter = async (req, res) => {

try {
  let {
    agePrivacy,
    cityPrivacy,
    emailPrivacy,
    contactPrivacy,
    name,
    age,
    email,
    phoneNo,
    city,
    province,
    country,
    qualifications,
  } = req.body;
  const {userId}=req.body;
  if (
    !name||
    !age||
    !agePrivacy||
    !cityPrivacy||
    !emailPrivacy||
    !contactPrivacy||
    !email||
    !phoneNo||
    !city ||
    !country ||
    !province ||
    !qualifications
  ) {
    throw new BadRequestError("You can not make required fields empty !");
  }
  let writer = await WritterModel.findOne({
    userId:userId,
  });
  if (!writer) {
    throw new BadRequestError("The Writer Not Exists");
  }

  await WritterModel.findByIdAndUpdate(
    
    writer._id,
    {
      $set: req.body,
    },
    { new: true }
  );

  res
    .status(StatusCodes.OK)
    .json({ msg: "Thw Writer is updated successfully" });

  
} catch (error) {
   res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
}



}







// Create formatter (English).

