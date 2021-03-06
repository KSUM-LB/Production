require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/user.router");
const couponRouter = require("./routes/coupon.router");
const roomRouter = require("./routes/room.router");
const tableRouter = require("./routes/table.router");
const bookingsRouter = require("./routes/bookings.router");
const referalRouter = require("./routes/referal.router");
const flightInfoEmailRouter = require("./routes/flightinfo.router");

// -- Initialize express app
const app = express();

// --- Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://www.yallacyprus.com",
      "https://yallacyprus.com",
      "http://www.yallacyprus.com",
      "https://yallacyprus.com",
      "www.yallacyprus.com",
      "yallacyprus.com",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

// -- Route Middleware
app.use("/user", userRouter);
app.use("/coupon", couponRouter);
app.use("/room", roomRouter);
app.use("/table", tableRouter);
app.use("/bookings", bookingsRouter);
app.use("/referal", referalRouter);
app.use("/flightInfoEmail", flightInfoEmailRouter);

// --- Default route
app.get("/", (req, res) => {
  res.send("YallaCyprus - KSUM");
});

// --- Listen on port
const PORT = process.env.PORT || 30001;
app.listen(PORT, () =>
  console.log("Server listening successfully on port ", PORT)
);
