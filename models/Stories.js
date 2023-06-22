import mongoose from "mongoose";

const storiesSchema = new mongoose.Schema(
  {
    views: {
      type: Number,
      default: 318 ,
    },
    title: {
      type: String,
      maxlength: 50,
    },
    description: {
      type: String,
      maxlength: 250,
    },
    isSponsored: {
      type: Boolean,
      default: false,
    },
    isHowSquareAdd: {
      type: Boolean,
      default: false,
    },
    btnName: {
      type: String,
      maxlength: 20,
    },
    btnUrl: {
      type: String,
      maxlength: 255,
    },
    imageUrl: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    lifeTime: {
      type: Number,
      default:1,
      enum: [1, 3,7,15,30,60,180],
    },
    expiryTime:{
      type: Date,
    },
    scheduleTime: {
      type: Date,
    },
    isDraft:{
    type:Boolean,
    default:false
    }
  },
  { timestamps: true }
);

storiesSchema.pre('save', function (next) {
  if (this.isModified('scheduleTime') || this.isModified('lifeTime') && !this.isDraft) {
    const scheduleTime = this.scheduleTime;
    const lifeTime = this.lifeTime;
    
    if (scheduleTime) {
      console.log(scheduleTime.getTime())
      const expiryTime = new Date(scheduleTime.getTime() + lifeTime * 24 * 60 * 60 * 1000);
      this.expiryTime = expiryTime;
    } else {
      // Handle the case when scheduleTime is undefined
      // and lifeTime has a value
      const currentDate = new Date();
      console.log(currentDate.getTime() )
      const expiryTime = new Date(currentDate.getTime() + lifeTime * 24 * 60 * 60 * 1000);
      this.expiryTime = expiryTime;
    }
  }
  next();
});

export default mongoose.model("Stories", storiesSchema);
