import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

const http = httpRouter();

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
}

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error("Webhook secret is missing");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      console.error("Missing necessary headers:", { svix_id, svix_signature, svix_timestamp });
      return new Response("Missing headers", { status: 400 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: ClerkWebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as ClerkWebhookEvent;
    } catch (e) {
      console.error("Webhook verification failed:", e);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("Received Clerk webhook:", evt);

    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      if (!email_addresses || email_addresses.length === 0) {
        console.error("No email found in webhook payload");
        return new Response("Invalid data", { status: 400 });
      }

      const email = email_addresses[0].email_address;
      const username = email.split('@')[0].replace(/\./g, ' ');

      try {
        await ctx.runMutation(api.users.createUser, {
          clerkId: id,
          email,
          username: username || "new_user_baby",
          image: image_url || "",
        });

        console.log("User successfully created in Convex.");
      } catch (error) {
        console.error("Error creating user in Convex:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    return new Response("Webhook received", { status: 200 });
  }),
});

export default http;
