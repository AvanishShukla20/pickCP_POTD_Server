const axios = require("axios");
const { getCFUserInfo, getCFUserSubmissions, getCFAllProblems } = require('../utils/cfApi');
const User = require('../models/User');

// GET RANDOM PROBLEM
const getRandomProblem = async (req, res) => {
  try {
    // Extract rating, tags, random, and handle from request body
    const { rating, tags = [], random, codeforcesHandle } = req.body;

    if (!codeforcesHandle) {
      return res.status(400).json({ error: "Codeforces handle is required in request body." });
    }

    // Fetch submissions for user handle from CF API (you need to implement getCFUserSubmissions)
    const submissions = await getCFUserSubmissions(codeforcesHandle);

    if (!submissions || !Array.isArray(submissions)) {
      return res.status(500).json({ error: "Failed to fetch user submissions from Codeforces." });
    }

    // Build set of solved problems
    const solvedSet = new Set(
      submissions
        .filter(s => s.verdict === 'OK')
        .map(s => `${s.problem.contestId}-${s.problem.index}`)
    );

    // Fetch all problems from CF (you need to implement getCFAllProblems)
    let problems = await getCFAllProblems();

    if (!problems || !Array.isArray(problems)) {
      return res.status(500).json({ error: "Failed to fetch problemset from Codeforces." });
    }

    // Filter problems according to logic:
    // if random === true => ignore rating/tags, just pick random unsolved
    // else filter by rating and tags, plus unsolved
    let filtered = [];

    if (random) {
      filtered = problems.filter(p => !solvedSet.has(`${p.contestId}-${p.index}`));
    } else {
      filtered = problems.filter(p => {
        if (rating && p.rating !== parseInt(rating)) return false;
        if (tags.length > 0) {
          const hasAllTags = tags.every(tag => p.tags.includes(tag));
          if (!hasAllTags) return false;
        }
        return !solvedSet.has(`${p.contestId}-${p.index}`);
      });
    }

    if (!filtered.length) {
      return res.status(404).json({ msg: "No unsolved problems found matching criteria." });
    }

    // Pick random from filtered
    const picked = filtered[Math.floor(Math.random() * filtered.length)];

    return res.status(200).json({ msg: "Problem fetched successfully", problem: picked });
  } catch (err) {
    console.error("Error in getRandomProblem:", err.message);
    return res.status(500).json({ error: "Server error while fetching random problem." });
  }
};


// MARK PROBLEM OF THE DAY
const markPOTD = async (req, res) => {
  try {
    const { problemId } = req.body;

    if (!problemId) {
      return res.status(400).json({ error: "Missing problemId in request body." });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized request. User not authenticated." });
    }

    const dbUser = await User.findById(userId).select('codeforcesHandle');
    if (!dbUser || !dbUser.codeforcesHandle) {
      return res.status(400).json({ error: "User's Codeforces handle is not set." });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const submissions = await getCFUserSubmissions(dbUser.codeforcesHandle);

    const hasSolved = submissions.some(sub => {
      return (
        sub.verdict === 'OK' &&
        `${sub.problem.contestId}-${sub.problem.index}` === problemId
      );
    });

    if (!hasSolved) {
      return res.status(400).json({ error: "Problem not yet solved. Please submit on Codeforces first." });
    }

    // Update user POTD status
    const update = {
      potd: {
        date: today,
        problemId,
        status: 'solved',
      },
    };

    const updated = await User.findByIdAndUpdate(userId, update, { new: true });

    if (!updated) {
      return res.status(404).json({ error: "User not found. POTD update failed." });
    }

    res.status(200).json({ msg: "POTD marked as solved successfully.", potd: update.potd });

  } catch (err) {
    console.error("Error in markPOTD:", err.message);
    res.status(500).json({ error: "Server error while marking POTD." });
  }
};

const getSolvedDates = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. User not authenticated." });
    }

    const user = await User.findById(userId).select('potd');

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    
    const solvedDates = (user.potd || [])
      .filter(entry => entry.status === "solved" && entry.date)
      .map(entry => entry.date);

    // Respond with an array of solved dates
    res.status(200).json({ dates : solvedDates });

  } catch (error) {
    console.error("Error fetching solved dates:", error.message);
    res.status(500).json({ error: "Server error while fetching solved dates." });
  }
};



module.exports = {
  markPOTD,
  getRandomProblem,
  getSolvedDates
};