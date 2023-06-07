import express from "express";
import Story from "../models/Stories.js";

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
    } = req.body;
    if (!(title && description) && !imageUrl && !videoUrl) {
      return res
        .status(400)
        .json({
          msg: "Please fill at least one of the fields: Title & Description, Image, or Video",
        });
    }
    const newStory = new Story({
      title,
      description,
      isSponsored,
      btnName,
      btnUrl,
      imageUrl,
      videoUrl,
    });

    await newStory.save();
        res.status(201).json({ msg: "Story created successfully" });
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
