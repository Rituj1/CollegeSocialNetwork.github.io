const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "Rituj@12345", // Replace with your MySQL password
  database: "CollegeProject", // Replace with your database name
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database!");
});

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rituj.vns@gmail.com", // Replace with your Gmail address
    pass: "ifpxqhbfhtnqlwxz", // Replace with your App Password
  },
});

// Routes

// Forgot Password - Generate OTP
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Check if email exists in the database
  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) return res.status(500).send("Database error!");

    if (results.length === 0) {
      return res.status(404).send("User not found!");
    }

    // Generate OTP and expiry time
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update database with OTP and expiry
    const updateOtpQuery = "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?";
    db.query(updateOtpQuery, [otp, expiry, email], (err) => {
      if (err) return res.status(500).send("Failed to update OTP!");

      // Send email with the OTP
      const mailOptions = {
        from: "your-email@gmail.com",
        to: email,
        subject: "Your Password Reset OTP",
        text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) return res.status(500).send("Failed to send email!");
        res.send("OTP sent successfully!");
      });
    });
  });
});

// Verify OTP and Reset Password
app.post("/verify-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Check OTP and expiry
  const checkOtpQuery = "SELECT otp, otp_expiry FROM users WHERE email = ?";
  db.query(checkOtpQuery, [email], async (err, results) => {
    if (err) return res.status(500).send("Database error!");

    if (results.length === 0) {
      return res.status(404).send("User not found!");
    }

    const { otp: storedOtp, otp_expiry: expiry } = results[0];
    const currentTime = new Date();

    if (storedOtp !== otp || currentTime > expiry) {
      return res.status(400).send("Invalid or expired OTP!");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    const updatePasswordQuery = "UPDATE users SET password = ?, otp = NULL, otp_expiry = NULL WHERE email = ?";
    db.query(updatePasswordQuery, [hashedPassword, email], (err) => {
      if (err) return res.status(500).send("Failed to reset password!");
      res.send("Password reset successfully!");
    });
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
