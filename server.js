const express = require('express');
const bodyParser = require('body-parser');
require("dotenv").config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3000;
const crypto = require("crypto");
const moment=require("moment");
const nodemailer=require("nodemailer");
const ResetToken = require("./Models/resetpassword_model");
const User=require("./Models/usermodel");
const ejs= require("ejs");
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
// MongoDB connection
async function connecttodb() {
    const url = process.env.MONGO_DB;
    console.log(url);
    try {
      await mongoose.connect(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
      console.log("connected");
    } catch (error) {
      console.log(error);
    }
  }
  connecttodb();

// Generate a random token
function generateToken() {
    return crypto.randomBytes(20).toString('hex');
  }

app.use(bodyParser.json());

// User Registration API
app.post('/api/user/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, username, password: hashedPassword });
        await newUser.save();
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Login API
app.post('/api/user/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id }, 'secret_key');
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Forgot Password API
app.post('/api/user/forgot-password', async (req, res) => {
    const {email}=req.body;
    const token=generateToken();
    const expires = moment().add(1, 'hour').toDate();

    try {
      // Save reset token to MongoDB
      await ResetToken.create({ email, token, expires });
  
      // Create Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 's6akshat2110045@gmail.com',
          pass: process.env.PASSWORD,
        }
      });
  
      // Send email with reset password link
      const mailOptions = {
        from: 'akshat2110045@akgec.ac.in',
        to: email,
        subject: 'Reset Password',
        text: `Click on the following link to reset your password: http://localhost:${PORT}/reset/${token}`
      };
  
      await transporter.sendMail(mailOptions);
      console.log('Reset password link sent to email:', email);
      res.json({ message: 'Reset password link sent to your email' });
    } catch (error) {
      console.error('Error sending reset password email:', error);
      res.status(500).json({ error: 'Failed to send reset password email' });
    }
    
});
app.route('/reset/:token').get( async (req, res) => {
    const { token } = req.params; 
    try {
      // Find reset token in MongoDB
      const resetToken = await ResetToken.findOne({ token });
  
      // Check if token exists and is not expired
      if (resetToken && moment().isBefore(resetToken.expires)) {
        // Allow user to reset password
        res.render("temp"); // Render reset password form
      } else {
        // Token is invalid or expired
        res.status(400).send('Invalid or expired reset password link');
      }
    } catch (error) {
      console.error('Error finding reset token:', error);
      res.status(500).json({ error: 'Failed to find reset token' });
    }
  }).post(async (req,res)=>{
    const {token}=req.params;
    const {newpass}=req.body;
    const hashedPassword = await bcrypt.hash(newpass, 10);
    try{
        const user_reset = await ResetToken.findOne({ token });
        const email=user_reset.email;
        const user=await User.findOne({email});
        user.password=hashedPassword;
        await user.save();
        // Password updated successfully
        res.send({ message: 'Password updated successfully' });
        }catch(err){
            console.error('Error updating password:', error);
            res.status(500).json({ error: 'Failed to update password' });
        }
  })
// app.route('reset/:token/newpassword',async(req,res)=>{
//     const {token}= req.params;
//     const {newpass}= req.body;
//     const hashedPassword = await bcrypt.hash(newpass, 10);
//     try{
//     const user_reset = await ResetToken.findOne({ token });
//     const email=user_reset.email;
//     const user=await User.findOne({email});
//     user.password=hashedPassword;
//     await user.save();
//     // Password updated successfully
//     res.send({ message: 'Password updated successfully' });
//     }catch(err){
//         console.error('Error updating password:', error);
//         res.status(500).json({ error: 'Failed to update password' });
//     }
// })
  
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
