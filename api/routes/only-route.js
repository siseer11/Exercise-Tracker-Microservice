const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const verifyDate = require("../../public/helperFunctions/verifyDate");



const Joi = require("joi");
const {
  Exercise,
  validate: validateExercise
} = require("../models/exerciseModel");
const { User , validate: validateUser} = require("../models/userModel");


//create new user (/api/exercise/new-user)
router.post("/new-user", async (req, res) => {
  //validate with joi
  const { error } = validateUser(req.body);
  if (error) {
    return res
      .status(500)
      .json({ msg: "An error ocured!", error: error.details[0].message });
  }
  try {
    //check to see if there is already in used
    const bodyUsername = req.body.username;
    const isUsernameUsed = await User.findOne({
      username: bodyUsername
    }).exec();

    if (isUsernameUsed) {
      res
        .status(400)
        .json({ msg: "Username already taken, please chose another one!" });
    }

    //save it
    const user = new User({
      username: bodyUsername
    });

    const dbRespose = await user.save();

    res.status(201).json({
      msg: "User created succesfully",
      data: dbRespose
    });
  } catch (error) {
    res.status(500).json({ msg: "An error ocured!", error: error });
  }
});

//retrieve all users (api/exercise/users)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-__v")
      .exec();
    res.status(200).json({
      msg: "Data fetched succesfully",
      data: users
    });
  } catch (err) {
    res.status(500).json({ msg: "An error ocured!", error: err });
  }
});

//create new exercise
router.post("/add", async (req, res) => {
  //check joi validation
  const { error } = validateExercise(req.body);
  if (error) {
    return res
      .status(500)
      .json({ msg: "An error ocured!", error: error.details[0].message });
  }

  try {
    //check if user exists
    const userExists = await User.findById(req.body.userId).exec();
    if (!userExists) {
      return res.status(400).json({
        msg: "User id does not match an user in the DB."
      });
    }
    //save the exercise
    const exercise = new Exercise({
      userId: req.body.userId,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date
    });

    const exerciseRespose = await exercise.save();

    //exercise saved succesfully
    res.status(201).json({
      msg: "exercise saved succesfully",
      data: exerciseRespose
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "An error ocured!", error: error });
  }
});

//full exercise log of any user
router.get("/log", async (req, res) => {
  const userId = req.query.userId;

  //No userId provided
  if (!userId) {
    return res.status(400).json({ msg: "You provided no userId." });
  }
  try {
    //Try to get the user
    const userData = await User.findById(userId).exec();
    if (!userData) {
      return res
        .status(404)
        .json({ msg: "No user in the database for the provided id." });
    }

    //Build the extra oprions object for querying
    const [dateFrom, dateTo, limit] = [
      req.query.from,
      req.query.to,
      req.query.limit
    ];
    let extraOptions = {};
    if (dateFrom || dateTo) {
      //Check to see if the dates are correct
      if (
        (dateFrom && !verifyDate(dateFrom)) ||
        (dateTo && !verifyDate(dateTo))
      ) {
        return res.status(400).json({
          msg:
            "The dates, from and to, must have a valid format.Please follow this format YYYY-MM-DD."
        });
      }

      //Create the extraOptions object
      extraOptions.date = {};
      if (dateFrom) {
        extraOptions.date.$gte = new Date(dateFrom).toISOString();
      }
      if (dateTo) {
        extraOptions.date.$lte = new Date(dateTo).toISOString();
      }
    }

    //Try to get the exercises
    const exercises = await Exercise.find({
      userId: userId,
      ...extraOptions
    })
      .select("-__v")
      .limit(limit ? Number(limit) : null)
      .exec();

    res.status(200).json({
      msg: "Data loaded succesfully",
      data: {
        username: userData.username,
        exercise: exercises,
        length: exercises.length
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "An error ocured!", error: err });
  }
});

module.exports = router;
