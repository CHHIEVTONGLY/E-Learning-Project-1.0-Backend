const axios = require("axios");

async function generateAccessToken() {
  const response = await axios({
    url: process.env.PAYPAL_BASE_URL + "/v1/oauth2/token",
    method: "post",
    data: "grant_type=client_credentials",
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET,
    },
  });

  return response.data.access_token;
}

exports.createOrder = async (itemname, itemdes, itemprice) => {
  const accessToken = await generateAccessToken();

  const response = await axios({
    url: process.env.PAYPAL_BASE_URL + "/v2/checkout/orders",
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    data: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          items: [
            {
              name: itemname,
              description: itemdes,
              quantity: 1,
              unit_amount: {
                currency_code: "USD",
                value: itemprice,
              },
            },
          ],

          amount: {
            currency_code: "USD",
            value: itemprice,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: itemprice,
              },
            },
          },
        },
      ],

      application_context: {
        return_url: process.env.BASE_URL + "/api/paypal/complete-order",
        cancel_url: process.env.BASE_URL + "/api/paypal/cancel-order",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        brand_name: "TongTong Store",
        landing_page: "BILLING",
      },
    }),
  });

  return response.data.links.find((link) => link.rel === "approve").href;
};

exports.capturePayment = async (orderId) => {
  const accessToken = await generateAccessToken();

  const response = await axios({
    url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}/capture`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
  });

  return response.data;
};
