import mongoose from "mongoose";
import validator from "validator";

let WritterSchema = new mongoose.Schema({
  // The Below are the necessary Fields for the writer
  name:{
    type:String,
    required:[true,"Please Provide Your Name"]
  },
  firstName: {
    type: String,
    required: [true, "Please Provide the first name"],
  },
  lastName: {
    type: String,
    required: [true, "Please Provide the last name"],
  },
  age: {
    type: String,
    required: [true, "Please Provide the age"],
  },
  agePrivacy:{
    type: String,
    default:"public"
  },

  cityPrivacy:{
    type: String,
    default:"public"
  },
emailPrivacy:{
  type: String,
  default:"public"
},
contactPrivacy:{
  type: String,
  default:"public"
},
  city: {
    type: String,
    required: [true, "Please Prvode the city"],
  },
  province: {
    type: String,
    required: [true, "Please Prvode the province"],
  },
  country: {
    type: String,
    required: [true, "Please Prvode the country"],
  },
  qualifications: {
    type: String,
    required: [true, "Please Prvode the qualifications"],
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
    unique: true,
  },
  phoneNo: {
    type: String,
    required: [true, "Please Provide the Phone Number"],
  },
  designation: {
    type: String,
  },
  purpose: {
    type: String,
    required: [true, "Please Provide your purpose to become the writter"],
  },
  userId:{
    type:String,
    required: [true, "Please first provide your userId"]
  },
  // The Wriiter Send the Request and then we need to approve it
  isApproved: {
    type: Boolean,
    default: false,
  },
  isDisapproved:{
    type:Boolean,
    default:false
  },
  disapprovedComment:{
    type:String,
    default:"You Go Againest Our Community Guidelines"
  },
  isRejected:{
    type:Boolean,
    default:false
  },
  // Below are the fields which writter if wants he can update in the future!
  photo: {
    type: String,
  },
  facebookId: {
    type: String,
  },
  instagramId: {
    type: String,
  },
  linkedinId: {
    type: String,
  },
  pinterestId: {
    type: String,
  },
  youtube: {
    type: String,
  },
  shortBio: {
    type: String,
  },
  description: {
    type: String,
  },
},
{ timestamps: true }
);

export default mongoose.model("writter", WritterSchema);
