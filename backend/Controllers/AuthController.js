import UserModel from "../Modules/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const otpStore = {}; // in-memory store

// --- SIGNUP INIT ---
const signupInit = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists. Please login.",
        success: false,
      });
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // store temporarily
    otpStore[email] = { name, email, password: hashedPassword, otp, createdAt: Date.now() };

    console.log("📩 Sending OTP to:", email, "OTP:", otp);

    // Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER, // Gmail address
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
      logger: true,
      debug: true,
    });

    // send OTP email
    await transporter.sendMail({
      from: `"HackMate Auth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Signup",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    console.log("✅ OTP sent successfully");

    return res.status(200).json({
      message: "OTP sent to email",
      success: true,
    });
  } catch (error) {
    console.error("❌ Error while sending OTP:", error);
    return res.status(500).json({
      message: "Error in signup-init",
      success: false,
      error: error.message,
    });
  }
};

// --- VERIFY OTP ---
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedData = otpStore[email];
    if (!storedData) {
      return res.status(400).json({ message: "OTP expired or not requested", success: false });
    }

    // check expiry
    if (Date.now() - storedData.createdAt > 5 * 60 * 1000) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired", success: false });
    }

    // check OTP match
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    // create user
    const newUser = new UserModel({
      name: storedData.name,
      email: storedData.email,
      password: storedData.password,
    });
    await newUser.save();

    // cleanup
    delete otpStore[email];

    // generate JWT
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(201).json({
      message: "Signup successful",
      success: true,
      token,
      user: { name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({
      message: "Error verifying OTP",
      success: false,
      error: error.message,
    });
  }
};

// --- LOGIN ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register.",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("❌ Error in login:", error);
    res.status(500).json({
      message: "Error in login",
      success: false,
      error: error.message,
    });
  }
};

export { signupInit, verifyOtp, login };
