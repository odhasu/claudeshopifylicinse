import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.TEST_STRIPE_KEY || process.env.STRIPE_SECRET_KEY!);

const PRICES: Record<string, number> = {
  LITE: 17900,
  PRO: 37900,
};

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();
    const amount = PRICES[plan];

    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { plan },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
