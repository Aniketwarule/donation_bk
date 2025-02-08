import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sgMail from "@sendgrid/mail";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

import multer from "multer";
const upload = multer({ dest: "uploads/" });

app.post("/create-campaign", upload.single("imageUrl"), async (req, res, next) => {
  try {
    const { title, description, goal, milestones, imageUrl } = req.body.data1;
    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        imageUrl,
        raised: "0",
        goal,
        daysLeft: 30,
      },
    });

    if (milestones.length > 0) {
      await prisma.milestone.createMany({
        data: milestones.map((milestone) => ({
          title: milestone.title,
          amount: milestone.amount,
          status: milestone.status || "pending", // Default status if missing
          campaignId: campaign.id,
        })),
      });
    }

    res.json({ success: true, message: "Campaign created successfully with ID: " + campaign.id });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


app.get('/campaigns', async (req, res) => {
  const result = await prisma.campaign.findMany({});
  res.json(result);
});

app.get('/milestones', async (req, res) => {
  const result = await prisma.milestone.findMany();
  res.json(result);
});

app.get('/campaigns/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id)
  const result = await prisma.campaign.findUnique({
    where: {
      id,
    },
  });
  res.json(result);
});


app.listen(5000, () => console.log("Server running on port 5000"));
