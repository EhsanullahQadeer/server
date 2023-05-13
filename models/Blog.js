import mongoose from "mongoose";

let BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please Provide the title"],
    },
    subTitle: {
      type: String,
      required: [true, "Please Provide the subTitle"],
    },
    description: {
      type: String,
      required: [true, "Please Provide the description"],
    },
    category: {
      type: String,
      enum: [
        "Travel",
        "Lifestyle",
        "Fashion",
        "Data Science",
        "Business",
        "Design",
        "Health",
        "Food",
        "Art",
      ],
      required: [true, "Please Provide your Category"],
    },
    status:{
     type:String,
     enum: ["Pending","Active","Rejected"],
     default:"Pending"
    },
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Provide the User Id"],
    },
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "writter",
      required: [true, "Provide the writterId"],
    },
    views:{
      type:Number,
      default:0
    }
  },
  { timestamps: true }
);

export default mongoose.model("blogs", BlogSchema);
