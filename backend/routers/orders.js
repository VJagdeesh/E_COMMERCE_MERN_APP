const express = require("express");
const router = express.Router();
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");

router.get("/", async (req, res) => {
  try {
    const order = await Order.find()
      .populate("user", "name")
      .sort({ dateOrdered: -1 });
    if (!order) {
      res.status(500).json({ success: false });
    }
    res.status(200).send(order);
  } catch (e) {
    res.status(500).json({ err: "Server side error " + e });
  }
});

router.get("/:id", async (req, res) => {
  try {
    let orderById = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      });
    if (!orderById) {
      res.status(404).json({ msg: "No order found" });
    }
    res.status(200).send(orderById);
  } catch (e) {
    res.status(500).json({ err: "Server side error " + e });
  }
});

router.post("/", async (req, res) => {
  try {
    const orderItemsIds = await Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      })
    );
    const total_prices = await Promise.all(
      orderItemsIds.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          "product"
        );
        const total = orderItem.quantity * orderItem.product.price;
        return total;
      })
    );
    const total_price = total_prices.reduce((a, b) => a + b, 0);
    console.log("total_prices ", total_prices);
    let order = new Order({
      orderItems: orderItemsIds,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: total_price,
      user: req.body.user,
    });
    order = await order.save();
    if (!order) {
      return res
        .status(400)
        .json({ success: false, msg: "Failed to create an order" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Side Error " + err });
  }
});

router.put("/:id", async (req, res) => {
  try {
    let order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, msg: "No Order Found" });
    }
    res.status(200).send(order);
  } catch (e) {
    res.status(500).json({ success: false, msg: "Server error!" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, msg: "Order not found." });
    }
    if (order) {
      order.orderItems.map(async (orderItem) => {
        await OrderItem.findByIdAndDelete(orderItem);
      });
      res.status(200).json({ success: true, data: "Deleted Successfully" });
    }
  } catch (e) {
    res.status(500).json({ success: false, msg: "Server Side error " + e });
  }
});

router.get("/get/totalsales", async (req, res) => {
  try {
    const total_Sales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);
    if (!total_Sales) {
      res.status(400).send("Data Not Found");
    }
    res.send({ totalsales: total_Sales.pop().totalsales });
  } catch (e) {
    return res.status(500).json({ message: "Server Side Error " + e });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    let ordersCount = await Order.countDocuments();
    if (!ordersCount) {
      return res.status(404).json({ message: "Products not found." });
    }
    res.status(200).json({ ordersCount: ordersCount });
  } catch (e) {
    return res.status(500).json({ message: "Server Side Error" });
  }
});

router.get("/get/userorders/:userid", async (req, res) => {
  try {
    const userOrderList = await Order.find({ user: req.params.userid })
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .sort({ dateOrdered: -1 });
    if (!userOrderList) {
      res.status(500).json({ success: false });
    }
    res.status(200).send(userOrderList);
  } catch (e) {
    res.status(500).json({ err: "Server side error " + e });
  }
});

module.exports = router;
