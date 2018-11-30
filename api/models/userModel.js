const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 2,
    maxlength: 100,
    trim: true,
    required: true,
    match: /[a-z0-9]+/i, //not the best for special letters
    unique: true
  }
});

const validate = body => {
  const joiSchema = {
    username: Joi.string()
      .min(2)
      .max(100)
      .alphanum()
      .required()
  };

  return Joi.validate(body, joiSchema);
};

module.exports.validate = validate;
module.exports.User = new mongoose.model("User", userSchema);
