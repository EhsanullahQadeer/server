import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

let adminSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Please provide email !"],
        validate:{
            validator:validator.isEmail,
            message:"Please provide a valid email !"
        },
        unique:true
    },
    password:{
        type:String,
        required:[true,"Please provide password !"],
        minlength:6,
        select:false
    },
    role:{
    type:String,
    default:"admin"
    }
})
adminSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });
  
adminSchema.methods.createJWT = function () {
    return jwt.sign(
      // { userId: this._id, role: this.role }
      { adminId: this._id,role:this.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_LIFETIME,
      }
    );
  };
  
  adminSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  };

export default mongoose.model("admin",adminSchema);