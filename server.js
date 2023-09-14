const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = express();
const port = 8000;
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
app.use(express.static(`${__dirname}/public`));
app.use(express.json()); //middleware: function that can modify the incoming request data (stands in the middle of req and res)
app.use((req, res, next) => {
  const requestTimestamp = new Date();
  console.log("Request received at:", requestTimestamp);
  req.requestTimestamp = requestTimestamp;
  console.log(requestTimestamp);
  next();
});

const userSchema = new mongoose.Schema({
  Number: { type: Number, unique: true },
  Name: String,
  Email: { type: String, unique: true },
  Balance: Number,
});

const historySchema = new mongoose.Schema({
  Name: String,
  Email: { type: String, unique: true },
  Amount: Number,
  Date: Date,
});

const userModel = mongoose.model("users", userSchema);
const historyModel = mongoose.model("history", historySchema);

const getUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    const allHistory = await historyModel.find();
    res.status(200).json({
      status: "success",
      data: users,
      history: allHistory,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
    });
  }
};

const updateUsers = async (req, res) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { Email: req.body.email },
      { $inc: { Balance: req.body.amount } },
      { new: true }
    );
    const userName = await userModel.findOne({ Email: req.body.email });
    const history = await historyModel.create({
      Name: userName.Name,
      Email: req.body.email,
      Amount: req.body.amount,
      Date: req.requestTimestamp,
    });
    if (!user) {
      console.error("User not found");
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const admin = await userModel.findOneAndUpdate(
      { Number: 0 },
      { $inc: { Balance: -req.body.amount } }
    );
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
    });
  }
};

mongoose.connect(DB, { useNewUrlParser: true }).then(() => {
  console.log("db connection success");

  app.get("/users", getUsers);
  app.patch("/users", updateUsers);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
