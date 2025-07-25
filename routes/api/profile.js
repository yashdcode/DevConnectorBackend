const express = require("express");
// const mongoose = require('mongoose');
const router = express.Router();
const config = require("config");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const request = require("request");
const Post = require("../../models/Post");
const { check, validationResult } = require("express-validator");

//@route GET api/profile/me
//@desc get the profile of users
//@access Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ mes: "There is no Profile for this user" });
    }
    return res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    return res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/profile
// @desc     Delete user and user profile
// @access   private
router.delete("/", auth, async (req, res) => {
  try {
    await Post.deleteMany({ user: req.user.id }); // Deleting Profile
    await Profile.findOneAndDelete({ user: req.user.id });
    // Deleting User
    await User.findOneAndDelete({ _id: req.user.id });
    res.json({ msg: "user deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/profile/experience
// @desc     update the profile with experience
// @access   private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is requires").not().isEmpty(),
      check("company", "Company name is requires").not().isEmpty(),
      check("from", "From date is requires").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, location, from, to, current, description } =
      req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/profile/experience/:experience_id
// @desc     delete the experience
// @access   private
router.delete("/experience/:experience_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    const experienceExists = profile.experience.some(
      (item) => item.id === req.params.experience_id
    );

    if (!experienceExists) {
      return res.status(404).json({ msg: "Experience not found" });
    }

    profile.experience = profile.experience.filter(
      (item) => item.id !== req.params.experience_id
    );

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/profile/education
// @desc     update the profile with education
// @access   private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "school is required").not().isEmpty(),
      check("degree", "Company name is required").not().isEmpty(),
      check("from", "From date is requirds").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { school, degree, fieldofstudy, from, to, current, position } =
      req.body;
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      position,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/profile/education/:education_id
// @desc     delete the education
// @access   private
router.delete("/education/:education_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    const educationExists = profile.education.some(
      (item) => item.id === req.params.education_id
    );

    if (!educationExists) {
      return res.status(404).json({ msg: "Education not found" });
    }

    profile.education = profile.education.filter(
      (item) => item.id !== req.params.education_id
    );

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/profile/user/:user_id
// @desc     Get Profile by user_id
// @access   Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;
    const profile = await Profile.findOne({ user: userId }).populate("user", [
      "name",
      "avatar",
    ]);
    res.json(profile);
    if (!profile) {
      return res.status(400).json({ msg: "Profile no found" });
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile no found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("inside POST");
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request
    const {
      company,
      location,
      bio,
      githubusername,
      website,
      skills,
      status,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    console.log(req.body);

    let profileFields = {};
    profileFields.user = req.user.id;
    if (company) {
      profileFields.company = company;
    }
    if (website) {
      profileFields.website = website;
    }
    if (location) {
      profileFields.location = location;
    }
    if (bio) {
      profileFields.bio = bio;
    }
    if (status) {
      profileFields.status = status;
    }
    if (githubusername) {
      profileFields.githubusername = githubusername;
    }
    if (skills) {
      profileFields.skills = Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => skill.trim());
    }

    profileFields.social = {};
    if (facebook) {
      profileFields.social.facebook = facebook;
    }
    if (linkedin) {
      profileFields.social.linkedin = linkedin;
    }
    if (status) {
      profileFields.social.instagram = instagram;
    }
    if (twitter) {
      profileFields.social.twitter = twitter;
    }
    if (youtube) {
      profileFields.social.youtube = youtube;
    }

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      //update
      //Using upsert option (creates new doc if no match is found):
      if (profile) {
        await Profile.findOneAndUpdate(
          {
            user: req.user.id,
          },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      console.log("profileFields", profileFields);
      profile = new Profile(profileFields);
      profile = await profile.save();
      return res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server error occured");
    }
  }
);
module.exports = router;

// @route    GET api/profile/github/:username
// @desc     Get user repositories from github
// @access   Public

router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No github profile found" });
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json("Server error");
  }
});
