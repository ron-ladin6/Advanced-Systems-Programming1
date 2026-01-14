const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      alias: "userId",
    },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    displayName: {
      type: String,
      default: function () {
        return this.username;
      },
    },
    image: { type: String },
  },
  {
    _id: false,
    id: false,
  }
);

module.exports = mongoose.model("User", userSchema);
