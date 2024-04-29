const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Product } = require("../models/product");
const { Category } = require("../models/category");

router.get("/", async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const product = await Product.find(filter).populate("category");
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

router.get("/:id", async (req, res) => {
  // let product = await Product.findById(req.params.id).select(
  //   "name -_id description richDescription"
  // );
  try {
    let product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      res.status(404).send({ success: false, error: "Not found" });
    }
    res.status(200).send(product);
  } catch (e) {
    res.status(500).send({ success: false, error: "Server Side Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(404).json({ success: false, message: "Id not found" });
    }
    const category = await Category.findById(req.body.category);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
    }
    let product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        dateCreated: req.body.dateCreated || Date.now(),
      },
      { new: true }
    );
    if (!product) {
      res.status(400).send("Invalid product");
    }
    res.status(200).send(product);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
    }
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
      dateCreated: req.body.dateCreated || Date.now(),
    });
    product = await product.save();
    if (!product) {
      res.status(400).send("Invalid product");
    }
    res.status(200).send(product);
  } catch (e) {
    res.status(500).json({ error: "server side error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "No such product exists!" });
    }
    res.json({ success: true, data: "Deleted Successfully!" });
  } catch (e) {
    res.status(500).json({ success: false, data: "Server Side Error" });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    let productsCount = await Product.countDocuments();
    if (!productsCount) {
      return res.status(404).json({ message: "Products not found." });
    }
    res.status(200).json({ productsCount: productsCount });
  } catch (e) {
    return res.status(500).json({ message: "Server Side Error" });
  }
});

router.get("/get/featured/:count", async (req, res) => {
  try {
    let count = req.params.count ? req.params.count : 10;
    let featuredProduct = await Product.find({ isFeatured: true }).limit(
      +count
    );
    if (!featuredProduct) {
      return res.status(404).json({ message: "Products not found." });
    }
    res.status(200).json(featuredProduct);
  } catch (e) {
    return res.status(500).json({ message: "Server Side Error" });
  }
});

module.exports = router;
