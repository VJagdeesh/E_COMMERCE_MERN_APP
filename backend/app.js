const express = require("express");
const app = express();
require("dotenv/config");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const { Product } = require("./models/product");
const { Category } = require("./models/category");
const { Order } = require("./models/order");
const { User } = require("./models/user");
const api = process.env.API_URL;
const productsRouter = require("./routers/products");
const categoriesRouter = require("./routers/categories");
const ordersRouter = require("./routers/orders");
const usersRouter = require("./routers/users");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");
const path = require("path");
app.use(express.json());
app.use(morgan("combined"));
app.use(authJwt());
app.use("/public/uploads", express.static("public/uploads"));
app.use(errorHandler);
app.use(cors());
app.options("*", cors());
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);

mongoose
  .connect(process.env.CONNECTION_URL)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((e) => {
    console.log(e);
  });

app.listen(3300, () => {
  console.log("Server started");
});
