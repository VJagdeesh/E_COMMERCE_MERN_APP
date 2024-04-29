const express = require("express");
const router = express.Router();
const { Order } = require("../models/order");

router.get("/", async (req, res) => {
  const product = await Order.find();
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

module.exports = router;
