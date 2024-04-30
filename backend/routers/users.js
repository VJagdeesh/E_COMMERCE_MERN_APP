const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const user = await User.find().select("-passwordHash");
  if (!user) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(user);
});

router.get("/:id", async (req, res) => {
  let user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    res.status(404).json({ message: "User not found" });
  }
  res.status(200).send(user);
});

router.post("/login", async (req, res) => {
  try {
    const secret = process.env.SECRET;
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json({ message: "Email is incorrect." });
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin,
        },
        secret,
        {
          expiresIn: "1d",
        }
      );
      res.status(200).json({
        user: user.email,
        token: token,
        message: "User logged in.",
      });
    } else {
      res.status(400).json({ message: "password is incorrect." });
    }
  } catch (e) {
    res.status(500).json({ message: "Server Side Error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      street: req.body.street,
      apartment: req.body.apartment,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
    });

    user = await user.save();

    if (!user) {
      res
        .status(400)
        .json({ success: false, msg: "Failed to create the user" });
    }

    res.status(200).send(user);
  } catch (e) {
    res.status(500).json({ error: "Server Side Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json("User not found");
    }
    res.json("User deleted");
  } catch (e) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    let userCount = await User.countDocuments();
    if (!userCount) {
      return res.status(404).json("No users found");
    }
    res.status(200).json({ user: userCount });
  } catch (e) {
    res
      .status(500)
      .json({ error: "Error in fetching data from database " + e });
  }
});

module.exports = router;
