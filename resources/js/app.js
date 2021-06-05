const { default: axios } = require("axios");
import Noty from "noty";
import { initAdmin } from "./admin";

let addToCart = document.querySelectorAll(".add-to-cart");
let cartCount = document.querySelector(".cartCount");

function updateCart(pizza) {
  axios
    .post("/update-cart", pizza)
    .then((res) => {
      cartCount.innerText = res.data.totalQty;
      new Noty({
        // theme: 'bootstrap-v4',
        type: "success",
        layout: "topCenter",
        text: "Item added successfully",
        timeout: 1000,
        progressBar: false,
        // animation: {
        //   open: 'animated bounceInRight', // Animate.css class names
        //   close: 'animated bounceOutRight' // Animate.css class names
        // },
      }).show();
    })
    .catch((err) => {
      new Noty({
        // theme: 'bootstrap-v4',
        type: "error",
        layout: "topCenter",
        text: "Something went wrong",
        timeout: 1000,
        progressBar: false,
        // animation: {
        //   open: 'animated bounceInRight', // Animate.css class names
        //   close: 'animated bounceOutRight' // Animate.css class names
        // },
      }).show();
    });
}

addToCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {

    console.log(btn.dataset.pizza);
    let pizza = JSON.parse(btn.dataset.pizza);
    updateCart(pizza);
  });
});

// Remove alert message after X seconds
const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2000);
}

initAdmin();

// Change order status
let statuses = document.querySelectorAll(".status_line");
let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement("small");

function updateStatus(order) {
  statuses.forEach((status) => {
    status.classList.remove("step-completed");
    status.classList.remove("current");
  });
  let stepCompleted = true;
  statuses.forEach((status) => {
    let dataProp = status.dataset.status;
    if (stepCompleted) {
      status.classList.add("step-completed");
    }
    if (dataProp === order.status) {
      stepCompleted = false;
      time.innerText = moment(order.updatedAt).format("hh:mm A");
      status.appendChild(time);
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add("current");
      }
    }
  });
}

updateStatus(order);
