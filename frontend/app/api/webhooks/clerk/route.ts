import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return new Response("Missing webhook secret", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;
  const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

  console.log(`[Clerk Webhook] event=${eventType} userId=${id}`);

  switch (eventType) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const primaryEmail = email_addresses.find(
        (e) => e.id === evt.data.primary_email_address_id
      )?.email_address;

      try {
        await fetch(`${API}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerk_id: id,
            email: primaryEmail,
            first_name,
            last_name,
            avatar_url: image_url,
          }),
        });
        console.log(`[user.created] synced to DB: ${primaryEmail}`);
      } catch (err) {
        console.error("[user.created] failed to sync:", err);
      }
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const primaryEmail = email_addresses.find(
        (e) => e.id === evt.data.primary_email_address_id
      )?.email_address;

      try {
        await fetch(`${API}/api/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: primaryEmail,
            first_name,
            last_name,
            avatar_url: image_url,
          }),
        });
        console.log(`[user.updated] synced to DB: ${id}`);
      } catch (err) {
        console.error("[user.updated] failed to sync:", err);
      }
      break;
    }

    case "user.deleted": {
      const { id } = evt.data;
      try {
        await fetch(`${API}/api/users/${id}`, { method: "DELETE" });
        console.log(`[user.deleted] removed from DB: ${id}`);
      } catch (err) {
        console.error("[user.deleted] failed to sync:", err);
      }
      break;
    }

    default:
      console.log(`[Clerk Webhook] unhandled: ${eventType}`);
  }

  return new Response("OK", { status: 200 });
}