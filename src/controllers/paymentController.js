// controllers/paymentController.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST);

/** POST /payment/intent — crear PaymentIntent de Stripe */
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "amount debe ser mayor a 0" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "mxn",
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

/** GET /payment/method/:paymentIntentId — obtener método de pago */
export const getPaymentMethod = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    const pm = await stripe.paymentMethods.retrieve(pi.payment_method);

    return res.json({
      brand: pm.card.brand,
      last4: pm.card.last4,
      funding: pm.card.funding,
      status: pi.status,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
