const PayIr = require("../config/payir");
const getWay = new PayIr("test");
const GIG = require("../model/gigs");

exports.getPayment = (req, res) => {
  let id = req.params.id;
  GIG.findOne({ where: { id } })
    .then((data) => {
      if (!data) res.redirect("/404");
      console.log(data.budget);
      getWay
        .send(
          +data.budget.substr(1),
          "http://localhost:3000/payment/verifyPayment"
        )
        .then((link) => res.redirect(link))
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
exports.postPayment = (req, res) => {
  getWay
    .verify(req.body)
    .then((data) => {
      console.log("Invoice (Factor) Number: " + data.factorNumber);
      console.log("Transaction ID: " + data.transactionId);
      console.log("Transaction Amount: " + data.amount);
      console.log("Card Number: " + data.cardNumber);
      res.end("Payment was successful.\nCheck the console for more details.");
    })
    .catch((err) => console.log(err));
};
