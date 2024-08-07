const { Buffer } = require("safe-buffer");
const crypto = require("crypto");

function getHash(str) {
  const hmac = crypto.createHmac("sha512", process.env.ABA_PUBLIC_KEY);
  hmac.update(str);
  return hmac.digest("base64");
}

const ABACreateOrder = async (req, res) => {
  try {
    const items = Buffer.from(
      JSON.stringify([
        { name: "Test1", quantity: 1, price: "10.00" },
        { name: "Test2", quantity: 1, price: "5.00" },
      ])
    ).toString("base64");

    const req_time = Math.floor(Date.now() / 1000);
    const tran_id = req_time;
    const amount = "10.00";
    const payment_option = "abapay";

    // Concatenate all values into a single string
    const hash = getHash(
      req_time +
        process.env.ABA_MERCHANT_ID +
        tran_id +
        amount +
        items +
        payment_option
    );

    res.send(`
      <form method="post" action="${process.env.ABA_PAYWAY_URL}" id = "aba_merchant_url">
        <input type="hidden" name="hash" value="${hash}" />
        <input type="hidden" name="tran_id" value="${tran_id}" />
        <input type="hidden" name="amount" value="${amount}" />
        <input type="hidden" name="items" value="${items}" />
        <input type="hidden" name="merchant_id" value="${process.env.ABA_MERCHANT_ID}" />
        <input type="hidden" name="req_time" value="${req_time}" />
        <input type="hidden" name="payment_option" value="${payment_option}" />
      </form>
      `);
  } catch (error) {
    console.error("Error in ABACreateOrder:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { ABACreateOrder };
