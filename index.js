import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sgMail from "@sendgrid/mail";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

const otpStorage = {};

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
  otpStorage[email] = otp;

  const message = {
    to: email,
    from: "aniketwarule775@gmail.com",
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
  };

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    await sgMail.send(message);
    res.json({ success: true, message: "OTP sent successfully", otp }); // Remove OTP in real implementation
  } catch (error) {
    console.error("Error sending OTP:", error.response ? error.response.body : error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  if (otpStorage[email] && otpStorage[email].toString() == code) {
    delete otpStorage[email]; // Remove OTP after verification
    return res.json({ success: true, message: "OTP Verified!" });
  }

  res.json({ success: false, message: "Invalid OTP" });
});


app.listen(5000, () => console.log("Server running on port 5000"));
