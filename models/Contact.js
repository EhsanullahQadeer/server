// This is the contact Schema if some one has the query then he will fill this form

import mongoose from "mongoose";
import validator from "validator";

let ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Provide the name"],
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
  contact: {
    type: String,
    required: [true, "Please Provide the contact"],
  },
  reason: {
    type: String,
    enum: ["Reason No1", "Reason No2", "Reason No2"],
    required: [true, "Please Provide the reason for you contact"],
  },
  message: {
    type: String,
    required: [true, "Please Provide the message"],
  },
});

export default mongoose.model("BlogAppContact", ContactSchema);
