const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const Post = require("../../models/Post");

//@route POST api/post
//@desc Creating Post
//@access Private

router.post(
  "/",
  [auth, [check("text", "text is reuired").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findById(req.user.id).select("-password");
    console.log("user", user);
    try {
      const newPost = new Post({
        user: req.user.id,
        text: req.body.text,
        avatar: user.avatar,
        name: user.name,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ error: "server error" });
    }
  }
);
module.exports = router;

//@route GET api/post
//@desc get all the post
//@access Private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

//@route GET api/post
//@desc get the post by id
//@access Private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

//@route GET api/post
//@desc deletd the post by id
//@access Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    //Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await post.deleteOne();
    res.json({ msg: "Post removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

//@route PUT api/post/like/:id
//@desc Post like
//@access Private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    let post = await Post.findById(id);
    if (!post) {
      return req.status(404).json({ mesg: "Post not found" });
    }
    const isUserLiked = post.likes.some(
      (like) => like.user.toString() === req.user.id
    );
    console.info(post);

    if (isUserLiked) {
      console.log("user already liked", isUserLiked);
      return res.status(400).json({ mesg: "User ha already liked the post" });
    }
    post.likes.unshift({ user: req.user.id });
    post = await post.save();
    res.json(post.likes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

//@route PUT api/post/unlike/:id
//@desc Post like
//@access Private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    let post = await Post.findById(id);
    if (!post) {
      return req.status(404).json({ mesg: "Post not found" });
    }
    const isUserLiked = post.likes.some(
      (like) => like.user.toString() === req.user.id
    );
    console.info(post);

    if (!isUserLiked) {
      console.log("user has not liked the profile", isUserLiked);
      return res.status(400).json({ mesg: "user has not liked the profile" });
    }
    post.likes = post.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );
    post = await post.save();
    return res.json(post.likes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

//@route POST api/post/comment/:id
//@desc Adding comment to the Post
//@access Private

router.post(
  "/comment/:id",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findById(req.user.id).select("-password");
    const post = await Post.findById(req.params.id);
    try {
      const comment = {
        user: req.user.id,
        text: req.body.text,
        avatar: user.avatar,
        name: user.name,
      };
      console.log("post", post);
      post.comments.unshift(comment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ error: "server error" });
    }
  }
);

//@route DELETE api/post/comment/:id/:comment_id
//@desc delete comment from the Post
//@access Private

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();

    return res.json(post.comments);
  } catch (error) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});
