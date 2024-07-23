const express = require("express");
const router = express.Router();
const { auth, upload } = require("../utiltis");
const { check, validationResult } = require("express-validator");
const normalize = require("normalize-url");

const Profile = require("../models/Profile");
const User = require("../models/User");
const Post = require("../models/PostM.js");

// To creat or update a new profile  => path /profiles
router.post(
  "/",
  auth,
  check("status", "status is required").notEmpty(),
  check("skills", "skills is required").notEmpty(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // client
    const {
      website,
      skills,
      youtube,
      twitter,
      instagram,
      github,
      facebook,
      ...rest
    } = req.body;

    const profile = {
      user: req.user.id, // comes from auth middleware fun ==>(user 's id)
      website:
        website && website !== ""
          ? normalize(website, { forceHttps: true })
          : "",
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => skill.trim()),
      ...rest,
    };

    let socialFields = { youtube, twitter, instagram, facebook, github };

    for (let key in socialFields) {
      const value = socialFields[key];
      if (value && value != "") {
        socialFields[key] = normalize(value, { forceHttps: true });
      }
    }

    console.log("social fields", socialFields);

    profile.social = socialFields;

    console.log("profile", profile);
    try {
      let profileObj = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profile },
        { new: true, upsert: true }
      );
      return res.json(profileObj);
    } catch (err) {
      console.error(err.message);
      res.status(500).send(err.message);
    }
  }
);

// get my profile

router.get("/me", auth, async (req, res) => {
  try {
    const myProfile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name"]);

    if (!myProfile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(myProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get all profiles in db
router.get("/", auth, async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name"]);

    console.log(profiles)

    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// get a spicefic profile
router.get("/user/:user_id", auth, async (req, res) => {
  const id = req.params.user_id;

  try {
    const profile = await Profile.findOne({
      user: id, // user 's id
    }).populate("user", ["name"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

// delete a profile

router.delete("/", auth, async (req, res) => {
  try {
    await Promise.all([
      Post.deleteMany({ user: req.user.id }),
      Profile.findOneAndDelete({ user: req.user.id }),
      User.findOneAndDelete({ _id: req.user.id }),
    ]);

    res.json({ msg: "User information is deleted successfuly" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

// recive user's profile image
router.post("/upload", auth, async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        res.status(500).send("server Error: " + err);
      } else {
        res.status(200).send(req.user.id);
      }
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
});

// creat experience

router.put(
  "/experience",
  auth,
  check("title", "Title is required").notEmpty(),
  check("company", "Company is required").notEmpty(),
  check("from", "From is required and needs to be from the past")
    .notEmpty()
    .custom((value, { req }) => {
      return req.body.to ? value < req.body.to : true;
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(req.body);
      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send(err.message);
    }
  }
);

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const expId = req.params.exp_id;
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience = profile.experience.filter((exp) => {
      return exp._id.toString() !== expId;
    });

    await profile.save();

    return res.json(profile);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
});

router.put(
  "/education",
  auth,
  check("school", "School is required").notEmpty(),
  check("degree", "Degree is required").notEmpty(),
  check("fieldofstudy", "Field is required").notEmpty(),
  check("from", "From is required and needs to be from the past")
    .notEmpty()
    .custom((value, { req }) => {
      return req.body.to ? value < req.body.to : true;
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(req.body);

      await profile.save();
      console.log(profile);

      return res.json(profile);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  }
);

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const eduId = req.params.edu_id;
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education = profile.education.filter((edu) => {
      return edu._id.toString() !== eduId;
    });

    await profile.save();

    console.log("profile in delet educatuion server", profile);
    return res.json(profile);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
});

module.exports = router;
