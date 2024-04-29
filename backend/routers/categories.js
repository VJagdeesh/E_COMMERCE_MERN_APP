const express = require("express");
const router = express.Router();
const { Category } = require("../models/category");

router.get("/", async (req, res) => {
  const category = await Category.find();
  if (!category) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(category);
});

router.get("/:id", async (req, res) => {
  let category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ msg: "Category not found" });
  }
  res.status(200).json(category);
});

router.put("/:id", async (req, res) => {
  let category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      color: req.body.color,
      icon: req.body.icon,
      image: req.body.image,
    },
    { new: true }
  );
  if (!category) {
    res.status(400).json({ msg: "Failed to update category." });
  }
  res.status(200).json(category);
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    color: req.body.color,
    icon: req.body.icon,
    // image: req.body.image,
  });

  category = await category.save();

  if (!category) {
    res.status(500).send("Data  not saved");
  }
  res.status(200).send(category);
});

router.delete("/:id", async (req, res) => {
  try {
    let category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res
        .status(404)
        .send({ success: false, error: "Category Not Found" });
    }
    res.status(200).send({ success: true, message: "Sucessfully removed" });
  } catch (e) {
    res.status(500).send({ success: false, error: e });
  }
});

// router.delete("/:id", (req, res) => {
//   Category.findByIdAndDelete(req.params.id)
//     .then((category) => {
//       if (!category) {
//         return res
//           .status(404)
//           .send({ success: false, error: "Category Not Found" });
//       }
//       res.status(200).send({ success: true, message: "Sucessfully removed" });
//     })
//     .catch((e) => {
//       res.status(500).send({ success: false, error: e });
//     });
// });

module.exports = router;
