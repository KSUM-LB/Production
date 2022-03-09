require("dotenv").config();
const express = require("express");
const userRouter = require("./routes/user.router");
const couponRouter = require("./routes/coupon.router");
const roomRouter = require("./routes/room.router");
const tableRouter = require("./routes/table.router");
const bookingRouter = require("./routes/booking.router");

// -- Initialize express app
const app = express();

// --- Middlewares
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// -- Route Middleware
app.use("/user", userRouter);
app.use("/coupon", couponRouter);
app.use("/room", roomRouter);
app.use("/table", tableRouter);
app.use("/booking", bookingRouter);

// --- Default route
app.get("/", (req, res) => {
    res.send("YallaCyprus - KSUM");
});

// --- Listen on port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
    console.log("Server listening successfully on port ", PORT)
);