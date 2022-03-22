require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/user.router");
const couponRouter = require("./routes/coupon.router");
const roomRouter = require("./routes/room.router");
const tableRouter = require("./routes/table.router");
const bookingRouter = require("./routes/booking.router");
const referalRouter = require("./routes/referal.router");

// -- Initialize express app
const app = express();

// --- Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

// -- Route Middleware
app.use("/user", userRouter);
app.use("/coupon", couponRouter);
app.use("/room", roomRouter);
app.use("/table", tableRouter);
app.use("/booking", bookingRouter);
app.use("/referal", referalRouter);

// --- Default route
app.get("/", (req, res) => {
  res.send("YallaCyprus - KSUM");
});

// --- Listen on port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log("Server listening successfully on port ", PORT)
);
