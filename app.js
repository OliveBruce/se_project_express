const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { errors } = require("celebrate");

const mainRouter = require("./routes/index");
const errorHandler = require("./middlewares/error-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

mongoose.set("strictQuery", true);

const app = express();

const { PORT = 3001, NODE_ENV, MONGODB_URI } = process.env;
const DB_URI = NODE_ENV === 'production' 
  ? MONGODB_URI 
  : "mongodb://127.0.0.1:27017/wtwr_db";

app.use(express.json());
app.use(cors());

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

app.use(requestLogger);
app.use("/", mainRouter);

app.use(errorLogger);
app.use(errors());

app.use(errorHandler);

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
