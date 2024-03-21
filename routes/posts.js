const express = require('express');
const bodyParser = require('body-parser');
require("dotenv").config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 3000;
const crypto = require("crypto");
const moment=require("moment");
const nodemailer=require("nodemailer");
const ResetToken = require("../Models/resetpassword_model");
const User=require("../Models/usermodel");
const router = express.Router();
const Post = require("../Models/post");
const verifyToken=require("../verifyToken");
const cookieParser=require("cookie-parser");
router.use(verifyToken); 
router.use(cookieParser());
// GET /posts: Retrieve all posts
router.get('/posts',verifyToken, async (req, res) => {
    try {
      const posts = await Post.find();
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// GET /posts/:author: Retrieve a specific post by Auther Name

router.get('/posts/:author',verifyToken,  async (req, res) => {
    let posts;
    try {
      // Retrieve the post based on the author's name
      posts = await Post.find({ author: req.params.author });
      if (!posts) {
        return res.status(404).json({ message: 'Post not found for the specified author' });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json(posts);
});

// POST /newpost: Create a new post
router.post('/newpost',verifyToken,  async (req, res) => {
    // Extract data from the request body
  const { author, content } = req.body;
  try {
    // Validate input data
    if (!author || !content) {
      return res.status(400).json({ message: 'Author and content are required' });
    }
    // Create a new post object
    const newPost = new Post({
      author,
      content
    });
    // Save the post to the database
    const savedPost = await newPost.save();
    // Return success response with the created post object
    res.status(201).json(savedPost);
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }

  });
    // PUT /updatepost/:postId: Update an existing post
router.put('/updatepost/:postId',verifyToken,  async (req, res) => {
  try {
    // Find the post by ID and update its data
    const updatedPost = await Post.findByIdAndUpdate(req.params.postId, req.body, { new: true });
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // Return the updated post
    res.json(updatedPost);
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
  });
  // delete /:postId to delete a post

  router.delete('/:postId',verifyToken,  async (req, res) => {
    try {
      // Find the post by ID and delete it
      const deletedPost = await Post.findByIdAndDelete(req.params.postId);
      if (!deletedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      // Return the deleted post
      res.json(deletedPost);
    } catch (err) {
      // Handle errors
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  // Endpoint to add a like to a post
  // Like a post
router.put('/:postId/like',verifyToken,  async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.postId, { $inc: { likes: 1 } }, { new: true });
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Endpoint to remove like from a post
router.put('/:postId/removelike',verifyToken,  async(req,res)=>{
   try{
    const updatedPost=await Post.findByIdAndUpdate(req.params.postId,{$inc: {likes: -1}},{new: true});
    if(!updatedPost){
      return res.status(404).json({message: "Post not found"});
    }
    res.json(updatedPost);
   }catch(err){
    console.error(err);
    res.status(500).json({message: "Internal Server Error"});
   }
});
// Endpoint to add a comment to a post
router.put('/:postId/addcomment',verifyToken, async(req,res)=>{
 
   const {comment}=req.body;
   if (!comment) {
    return res.status(400).json({ message: 'Comment content is required' });
  }
  try{
   const updatedPost=await Post.findOneAndUpdate({_id: req.params.postId}, { $push: { comments: comment } }, { new: true });
  if(!updatedPost){
    return res.status(404).json({message:"Post not found"});
  }
  res.json(updatedPost);
  }catch(err){
console.error(err);
res.status(500).json({message: "Internal Server Error"});
  }
});
// Endpoint to remove a comment from a  post
router.put('/:postId/removecomment',verifyToken, async(req,res)=>{
 
  const {comment}=req.body;
  if (!comment) {
   return res.status(400).json({ message: 'Comment content is required' });
 }
 try{
  const updatedPost=await Post.findOneAndUpdate({_id: req.params.postId}, { $pull: { comments: comment } }, { new: true });
 if(!updatedPost){
   return res.status(404).json({message:"Post not found"});
 }
 res.json(updatedPost);
 }catch(err){
console.error(err);
res.status(500).json({message: "Internal Server Error"});
 }
});
  module.exports= router;
