const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");
const Candidate = require("./../models/candidate");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === "admin") {
      return true;
    }
  } catch (err) {
    return false;
  }
};
//POST route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    const isAdmin = await checkAdminRole(req.user.id);
    console.log(isAdmin);
    if (!isAdmin) {
      return res.status(403).json({ message: "User has no admin rights" });
    }
    const data = req.body; //Assuming the request body contains the candidate data

    //Create a newPerson document using the Mongoose model
    const newCandidate = new Candidate(data);

    //Save the new person to the database
    const response = await newCandidate.save();
    console.log("data saved");
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

router.put("/candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "User has no admin rights" });
    }
    const candidateID = req.params.candidateID; // extract id from the url parameter
    const updatedcandidateID = req.body; //updated data for the person

    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedcandidateID,
      {
        new: true, // return the updated document
        runValidators: true, // run mongoose valiation (all the required fields)
      }
    );

    // 2nd possibility if we dont find any document of that id
    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Candidate updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

router.delete("/candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "User has no admin rights" });
    }
    const candidateID = req.params.candidateID; // extract id from the url parameter

    const response = await Candidate.findByIdAndDelete(candidateID);

    // 2nd possibility if we dont find any document of that id
    if (!response) {
      return res.status(404).json({ error: "Person not found" });
    }

    console.log("Candidate deleter");
    res.status(200).json({ message: "person deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// Lets start voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  //no admin can vote
  //user can only vote once

  candidateID = req.params.candidateID;
  userID = req.user.id;

  try {
    //Find candidate document with the specified candidateID
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVoted) {
      return res.status(404).json({ message: "User already voted" });
    }

    if (user.role === "admin") {
      return res.status(404).json({ message: "Admin can not vote" });
    }

    //Update the candidate document to record the vote
    candidate.votes.push({ user: userID });
    candidate.voteCount++;
    await candidate.save();

    //Update the user document
    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: "Vote recorded successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

//Vote count

router.get("/vote/count", async (req, res) => {
  try {
    //Find all candidates and sort them by voteCount in descending order
    const candidate = await Candidate.find().sort({ voteCount: "desc" });

    //Map the candidates to only return their name and voteCount
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });

    return res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const candidateID = req.params.id; // Extract candidate ID from request parameters

    // Find the candidate by their ID in the database
    const candidate = await Candidate.findById(candidateID);

    if (!candidate) {
      // If candidate is not found, return a 404 Not Found response
      return res.status(404).json({ error: "Candidate not found" });
    }

    // If candidate is found, return their name in the response
    res.status(200).json({ name: candidate.name });
  } catch (err) {
    // If an error occurs, return a 500 Internal Server Error response
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
