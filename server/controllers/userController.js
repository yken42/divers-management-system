import User from "../models/userSchema.js";
import Dive from "../models/diveSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const createUser = async (req, res) => {
  const { email, password, fullName, licenseNumber, role } = req.body;

  // Validate required fields
  if (!email || !password || !fullName) {
    return res.status(400).json({
      message: "Email, password, and fullName are required",
    });
  }

  try {
    // Check if user already exists with the same email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      password: bcrypt.hashSync(password, 10),
      licenseNumber,
      role: role || "student",
    });
    await newUser.save();
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        licenseNumber: newUser.licenseNumber,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        licenseNumber: user.licenseNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
