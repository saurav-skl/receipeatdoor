const authControllers = require("../app/http/controllers/authControllers");
const homeControllers = require("../app/http/controllers/homeControllers");
const cartControllers = require("../app/http/controllers/customers/cartControllers");
const orderControllers = require("../app/http/controllers/customers/orderControllers");
const adminOrderController = require("../app/http/controllers/admin/orderControllers");
const statusController = require("../app/http/controllers/admin/statusControllers");
const express = require("express");
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });
const checksum_lib = require("../resources/views/Paytm/checksum");
const config = require("../resources/views/Paytm/config");
const qs = require("querystring");

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
  app.get("/customer-orders-:id", auth, orderControllers().show);

  // Admin routes
  app.get("/admin-orders", admin, adminOrderController().index);
  app.post("/admin-order/status", admin, statusController().update);

  //  Payment Gateway Starts

  app.get("/paynow", (req, res) => {
    res.render("payment");
  });

  app.post("/paynow", [parseUrl, parseJson], (req, res) => {
    // Route for making payment

    var paymentDetails = {
      amount: req.body.amount,
      customerId: req.body.id,
      customerEmail: req.body.email,
      customerPhone: req.body.phone,
    };
    if (
      !paymentDetails.amount ||
      !paymentDetails.customerId ||
      !paymentDetails.customerEmail ||
      !paymentDetails.customerPhone
    ) {
      res.status(400).send("Payment failed");
    } else {
      var params = {};
      params["MID"] = process.env.PAYTM_MID;
      params["WEBSITE"] = process.env.PAYTM_WEBSITE;
      params["CHANNEL_ID"] = "WEB";
      params["INDUSTRY_TYPE_ID"] = "Retail";
      params["ORDER_ID"] = "TEST_" + new Date().getTime();
      params["CUST_ID"] = paymentDetails.customerId;
      params["TXN_AMOUNT"] = paymentDetails.amount;
      params["CALLBACK_URL"] = process.env.CALLBACK_URL;
      params["EMAIL"] = paymentDetails.customerEmail;
      params["MOBILE_NO"] = paymentDetails.customerPhone;

      checksum_lib.genchecksum(
        params,
        process.env.PAYTM_KEY,
        function (err, checksum) {
          var txn_url =
            "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
          // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

          var form_fields = "";
          for (var x in params) {
            form_fields +=
              "<input type='hidden' name='" +
              x +
              "' value='" +
              params[x] +
              "' >";
          }
          form_fields +=
            "<input type='hidden' name='CHECKSUMHASH' value='" +
            checksum +
            "' >";

          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(
            '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
              txn_url +
              '" name="f1">' +
              form_fields +
              '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
          );
          res.end();
        }
      );
    }
  });
  app.post("/callback", (req, res) => {
    // Route for verifiying payment

    var body = "";

    req.on("data", function (data) {
      body += data;
    });

    req.on("end", function () {
      var html = "";
      var post_data = qs.parse(body);

      // received params in callback
      console.log("Callback Response: ", post_data, "\n");

      // verify the checksum
      var checksumhash = post_data.CHECKSUMHASH;
      // delete post_data.CHECKSUMHASH;
      var result = checksum_lib.verifychecksum(
        post_data,
        config.PaytmConfig.key,
        checksumhash
      );
      console.log("Checksum Result => ", result, "\n");

      // Send Server-to-Server request to verify Order Status
      var params = { MID: config.PaytmConfig.mid, ORDERID: post_data.ORDERID };

      checksum_lib.genchecksum(
        params,
        config.PaytmConfig.key,
        function (err, checksum) {
          params.CHECKSUMHASH = checksum;
          post_data = "JsonData=" + JSON.stringify(params);

          var options = {
            hostname: "securegw-stage.paytm.in", // for staging
            // hostname: 'securegw.paytm.in', // for production
            port: 443,
            path: "/merchant-status/getTxnStatus",
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Content-Length": post_data.length,
            },
          };

          // Set up the request
          var response = "";
          var post_req = https.request(options, function (post_res) {
            post_res.on("data", function (chunk) {
              response += chunk;
            });

            post_res.on("end", function () {
              console.log("S2S Response: ", response, "\n");

              var _result = JSON.parse(response);
              if (_result.STATUS == "TXN_SUCCESS") {
                res.send("payment sucess");
              } else {
                res.send("payment failed");
              }
            });
          });

          // post the data
          post_req.write(post_data);
          post_req.end();
        }
      );
    });
  });
  // Payment Gateway Ends
}

module.exports = initRoutes;
