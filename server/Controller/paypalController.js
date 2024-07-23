// controllers/paymentController.js
const paypal = require("../services/paypal");

const pay = async (req, res) => {
  try {
    const url = await paypal.createOrder();
    res.redirect(url);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

const createOrder = async (req, res) => {
  try {
    const { itemName, itemDescription, itemPrice } = req.body;
    const url = await paypal.createOrder(itemName, itemDescription, itemPrice);
    res.json({ approveUrl: url });
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

const completeOrder = async (req, res) => {
  try {
    await paypal.capturePayment(req.query.token);
    // res.send("Course purchased successfully");
    res.redirect(process.env.FRONT_URL + "/complete-order");
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

const cancelOrder = (req, res) => {
  res.redirect("/");
};

module.exports = { pay, cancelOrder, completeOrder, createOrder };
