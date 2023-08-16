import express from "express";
import Story from "../models/Stories.js";
import StoriesViews from "../models/StoriesViews.js";
import { StatusCodes } from "http-status-codes";
import InternalServerError from "../errors/front/ServerError.js";
import response from "../errors/response.js";
import { checkUser } from "../middleware/Checking.js";

// Create a new story
export const createStory = async (req, res) => {
  try {
    const {
      title,
      description,
      isSponsored,
      btnName,
      btnUrl,
      imageUrl,
      videoUrl,
      scheduleTime,
      isHowSquareAdd,
      lifeTime,
      isDraft,
    } = req.body;
    if (!(title && description) && !imageUrl && !videoUrl) {
      return res.status(400).json({
        msg: "Please fill at least one of the fields: Title & Description, Image, or Video",
      });
    }
    //preventing to storing undefined as a string
    const storyData = {
      ...(title !== "undefined" && { title }),
      ...(description !== "undefined" && { description }),
      ...(btnName !== "undefined" && { btnName }),
      ...(btnUrl !== "undefined" && { btnUrl }),
      ...(imageUrl !== "undefined" && { imageUrl }),
      ...(videoUrl !== "undefined" && { videoUrl }),
      ...(scheduleTime !== "undefined" || (null && { scheduleTime })),
      isSponsored,
      isHowSquareAdd,
      lifeTime,
      isDraft,
    };

    const newStory = new Story(storyData);
    await newStory.save();
    res.status(StatusCodes.OK).json({ msg: "Story created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
//get stories
export const getStories = async (req, res) => {
  let { userId } = req.params;
  const page = req.query.pageIndex ? +req.query.pageIndex : 1;
  const skip = (page - 1) * 10;
  const actionSkip = (page - 1) * 2;
  //
  let currentDate = new Date();

  try {
    let count;
    let query = {
      isHowSquareAdd: false,
      isSponsored: true,
      isDraft: false,
      expiryTime: { $gt: currentDate },
      $or: [{ scheduleTime: { $lte: currentDate } }, { scheduleTime: null }],
    };
  //sponsored stories
    const sponsoredStories = await Story.find(query)
      .sort({ updatedAt: -1 })
      .skip(actionSkip)
      .limit(2)
      .lean()
      .exec();
      //counts
      //we dont need to execute this query again and
      if(page<=1){
        count={};
        count.sponsored = await Story.where(query).countDocuments();
      }

    //How square Add
    query.isHowSquareAdd = true;
    query.isSponsored = false;
    const HowSquareAddStories = await Story.find(query)
      .sort({ updatedAt: -1 })
      .skip(actionSkip)
      .limit(2)
      .lean()
      .exec();
      //counts
      if(page<=1){
      count.howSquareAdd = await Story.where(query).countDocuments();
      }
    //simple stories
    query.isHowSquareAdd = false;
    query.isSponsored = false;
    const simpleStories = await Story.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(10)
      .lean()
      .exec();
      //counts
      if(page<=1){
      count.simpleStories = await Story.where(query).countDocuments();
      }

    // Sort the viewed stories at end
    let sortedStories = [
      ...sponsoredStories,
      ...HowSquareAddStories,
      ...simpleStories,
    ];
    if (userId) {
      const viewedStories = await StoriesViews.find({ user: userId })
        .lean()
        .exec();

        //sorting logics
      const viewedStoryIds = viewedStories.map((item) => item.story.toString());

      let notViewedSortedStories = sortedStories.filter(
        (item) => !viewedStoryIds.includes(item._id.toString())
      );
      let viewdsortedStories = sortedStories.filter((item) =>
        viewedStoryIds.includes(item._id.toString())
      );
      // Assuming `viewdsortedStories` is your array to be sorted
      viewdsortedStories.sort((a, b) => {
        const aViewedStory = viewedStories.find(
          (item) => item.story.toString() === a._id.toString()
        );
        const bViewedStory = viewedStories.find(
          (item) => item.story.toString() === b._id.toString()
        );
        if (aViewedStory && bViewedStory) {
          return aViewedStory.updatedAt - bViewedStory.updatedAt; // Ascending order
        } else if (aViewedStory) {
          return 1; // b comes before a
        } else if (bViewedStory) {
          return -1; // a comes before b
        } else {
          return 0; // Neither has updatedAt, maintain order
        }
      });

      sortedStories = [...notViewedSortedStories, ...viewdsortedStories];
    }
    response(res, {sortedStories,count});
  } catch (error) {
    console.log(error);
    InternalServerError(res);
  }
};
//counting views
export const viewStory = async (req, res) => {
  try {
    const { storyId, userId } = req.params;
    //checkUser

    // Check if the story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ msg: "Story not found" });
    }
    if (await checkUser(userId)) {
      const storyView = await StoriesViews.findOne({
        story: storyId,
        user: userId,
      });

      if (storyView) {
        // If the document exists, update the timestamp
        storyView.updatedAt = new Date();
        await storyView.save();
      } else {
        const storyView = new StoriesViews({
          story: storyId,
          user: userId,
          viewed: true,
        });
        const savedStoryView = await storyView.save();
      }
    }
    // Increment the view count in the Stories collection
    await Story.findByIdAndUpdate(storyId, { $inc: { views: 2 } });

    return res.status(200).json({ msg: "Story viewed successfully" });
  } catch (error) {
    console.log("Error viewing story:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
