const express = require("express");
const router = express.Router();

const {
  pay,
  cancelOrder,
  completeOrder,
  createOrder,
} = require("../Controller/paypalController");

router.post("/pay", pay);
router.post("/create-order", createOrder);
router.get("/complete-order", completeOrder);
router.get("/cancel-order", cancelOrder);

module.exports = router;
