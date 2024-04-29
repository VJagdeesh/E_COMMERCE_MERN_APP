const express = require("express");
const router = express.Router();
const { User } = require("../models/user");

router.get("/", async (req, res) => {
  const product = await User.find();
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

module.exports = router;
