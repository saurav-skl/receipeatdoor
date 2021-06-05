const Order = require("../../../models/order");
const moment = require("moment");

function orderControllers() {
  return {
    store(req, res) {
      const { address, phone } = req.body;
      if (!address || !phone) {
        req.flash("error", "Something went wrong!");
        return res.redirect("/cart");
      }
      if (!req.user._id) return res.redirect("/");

      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone: phone,
        address: address,
      });

      order
        .save()
        .then((result) => {
          // delete req.session.cart;
          req.flash("success", "Order placed Successfully");
          res.redirect("/paynow");
        })
        .catch((err) => {
          req.flash("error", "Something went Wrong");
          return res.redirect("/cart");
        });
    },
    async index(req, res) {
      const orders = await Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
      });
      res.header(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
      );
      return res.render("customers/orders", { orders: orders, moment: moment });
      // console.log(orders);
    },
    async show(req, res) {
      const order = await Order.findById(req.params.id);
      // Authorize user
      if (req.user._id.toString() === order.customerId.toString()) {
        return res.render("customers/singleOrder", { order });
      }
      return res.redirect("/");
    },
    // show(req, res) {
    //   console.log(req.body);
    //   return res.json({ Okay: "1" });
    // },
  };
}

module.exports = orderControllers;
