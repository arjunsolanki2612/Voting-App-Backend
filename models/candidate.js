const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
//Creating Person schema
const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // the name value cannot be null it is required
  },
  party: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId, // id given by mongoose
        ref: "User",
        required: true,
      },

      votedAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],

  voteCount: {
    type: Number,
    default: 0,
  },
});

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
