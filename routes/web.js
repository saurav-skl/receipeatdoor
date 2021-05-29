const authControllers = require("../app/http/controllers/authControllers");
const homeControllers = require("../app/http/controllers/homeControllers");
const cartControllers = require("../app/http/controllers/customers/cartControllers");
const orderControllers = require("../app/http/controllers/customers/orderControllers");
const adminOrderController = require("../app/http/controllers/admin/orderControllers");

// Middleware
const guest = require("../app/http/middleware/guest");
const auth = require("../app/http/middleware/auth");
const admin = require("../app/http/middleware/admin");

function initRoutes(app) {
  app.get("/", homeControllers().index);

  app.get("/login", guest, authControllers().login);
  app.post("/login", authControllers().postLogin);

  app.get("/register", guest, authControllers().register);
  app.post("/register", authControllers().postRegister);

  app.post("/logout", authControllers().logout);

  app.get("/cart", cartControllers().index);
  app.post("/update-cart", cartControllers().update);

  // Customer Routes
  app.post("/order", auth, orderControllers().store);
  app.get("/customer-orders", auth, orderControllers().index);

  // Admin routes
  app.get("/admin-orders", admin, adminOrderController().index);
}

module.exports = initRoutes;
