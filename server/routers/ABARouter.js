const express = require("express");
const router = express.Router();

const { ABACreateOrder } = require("../Controller/ABAController");

router.post("/checkout", ABACreateOrder);

module.exports = router;
