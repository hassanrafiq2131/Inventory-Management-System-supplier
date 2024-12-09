// import Stripe from 'stripe';
// import dotenv from 'dotenv';
// dotenv.config();
// // Initialize Stripe with your secret key
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// /**
//  * Create a Payment Session
//  */
// export const createPaymentSession = async (req, res) => {
//     try {
//       const { items } = req.body;
  
//       if (!items || items.length === 0) {
//         return res.status(400).json({ error: "No items provided for payment session." });
//       }
  
//       // Format items for Stripe session
//       const lineItems = items.map((item) => ({
//         price_data: {
//           currency: "usd",
//           product_data: {
//             name: item.name,
//           },
//           unit_amount: item.price * 100,
//         },
//         quantity: item.quantity,
//       }));
  
//       // Create Stripe checkout session
//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         mode: "payment",
//         line_items: lineItems,
//         success_url: `${process.env.CLIENT_URL}/orders`,
//         cancel_url: `${process.env.CLIENT_URL}/order`,
//       });
  
//       res.status(200).json({ sessionId: session.id });
//     } catch (error) {
//       console.error("Error creating payment session:", error);
//       res.status(500).json({ error: "Failed to create payment session." });
//     }
// };