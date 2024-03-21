const express = require('express');
const bodyParser = require('body-parser');
require("dotenv").config();
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;
const cookieParser=require("cookie-parser");
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(cookieParser());
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
      console.log("not connected");
    }
  }
  connecttodb();
app.use(bodyParser.json());
// Routes
const authRouter = require('./routes/authentication');
const postRouter=require("./routes/posts");
app.use('/api/user', authRouter);
app.use("",postRouter);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
