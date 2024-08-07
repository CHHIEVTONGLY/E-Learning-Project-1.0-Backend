const express = require("express");
const router = express.Router();

const { ABACreateOrder } = require("../Controller/ABAController");

console.log("ABACreateOrder:", ABACreateOrder); // Add this line
router.post("/checkout", ABACreateOrder);

module.exports = router;
