require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3300;
const ejs = require("ejs");
const path = require("path");
const expressLayout = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo");
const passport = require("passport");

// Database connections
const url =
  "mongodb+srv://pizzaboy:test123@cluster0.fwgvs.mongodb.net/pizza?retryWrites=true&w=majority";
mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
});
const connections = mongoose.connection;
connections
  .once("open", () => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("Connections Failed");
  });

// Session store

// let mongoStore = new MongoDbStore({
//   mongooseConnection: connections,
//   collection: "sessions",
// });

// Session config

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDbStore.create({ mongoUrl: url }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
  })
);

// Passport Config
const passportInit = require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Assets
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Global Middleware

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

// set template engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

require("./routes/web")(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  var timestamp = new Date().toLocaleString();
  console.log(timestamp);
});
