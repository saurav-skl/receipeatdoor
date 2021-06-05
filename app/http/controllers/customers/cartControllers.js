const { json } = require("express")

function cartControllers() {
  return {
    index(req, res) {
      res.render("customers/cart");
    },



    update(req, res) {
      // let cart = {
      //     items: {
      //         pizzaId: { item: pizzaObject, qty:0 },
      //         pizzaId: { item: pizzaObject, qty:0 },
      //         pizzaId: { item: pizzaObject, qty:0 },
      //     },
      //     totalQty: 0,
      //     totalPrice: 0
      // }
      // for the first time creating cart and adding basic object structure
      // console.log(req.body[0]._id);
      if (!req.session.cart) {
        req.session.cart = {
          items: {},
          totalQty: 0,
          totalPrice: 0,
        };
      }

      let cart = req.session.cart;

      // Check if item does not exist in cart 

      if (!cart.items[req.body._id]) {
        cart.items[req.body._id] = {
          item: req.body,
          qty: 1
        }
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + req.body.price;
      } else {
        cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + req.body.price;
      }

      // for(let item of Object.values(cart.items))
      //   console.log(item.item['_id']);
      // console.log(req.body._id)
      // console.log(cart.items[req.body._id])
      
      return res.json({ totalQty: req.session.cart.totalQty });
    },
  };
}

module.exports = cartControllers;
