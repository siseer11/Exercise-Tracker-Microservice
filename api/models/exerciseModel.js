const mongoose = require("mongoose");
const Joi = require("joi");

const exerciseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  date: {
    type: Date,
    min: Date.now,
    default: Date.now,
    set: date => new Date(date).toISOString()
  },
  description: {
    type: String,
    required: true,
    min: 5,
    max: 255
  },
  duration: {
    type: Number,
    min: 1,
    required: true
  }
});

const validate = body => {
  const joiSchema = {
    userId: Joi.string().required(),
    description: Joi.string()
      .min(5)
      .max(255)
      .required(),
    duration: Joi.number()
      .min(1)
      .required(),
    date: Joi.date().min("now")
  };
  return Joi.validate(body, joiSchema);
};

module.exports.validate = validate;
module.exports.Exercise = mongoose.model("Exercise", exerciseSchema);
