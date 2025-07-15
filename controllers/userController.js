const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  const { name, college, codeforcesHandle, email, password } = req.body;

  if (!name || !college || !codeforcesHandle || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Check if email  already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    // check if codeforces handle exists 

    const existingHandle = await User.findOne({ codeforcesHandle });
    if (existingHandle) {
      return res.status(409).json({ error: "Codeforces handle is already linked to another account." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      college,
      codeforcesHandle,
      email,
      password: hashedPassword
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        codeforcesHandle: user.codeforcesHandle,
        college: user.college,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Server error while registering user." });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Both Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found! Please check your email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        codeforcesHandle: user.codeforcesHandle,
        college: user.college,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error during login." });
  }
};


const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ error: "Server error while fetching profile." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser
};
