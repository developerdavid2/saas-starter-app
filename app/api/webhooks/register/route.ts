import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET to your .env file");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_signature || !svix_timestamp) {
    return new NextResponse("Error: Missing svix headers", { status: 400 });
  }

  const headerSvix = {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  };

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, headerSvix) as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return new NextResponse("Error: Webhook verification failed", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook received: ${eventType} for user ${id}`);

  if (eventType === "user.created") {
    try {
      const { email_addresses, primary_email_address_id } = evt.data;

      // Handle test webhooks with no email addresses
      if (!email_addresses || email_addresses.length === 0) {
        console.log(
          "Test webhook received with no email addresses - skipping user creation",
        );
        return new NextResponse("Test webhook received successfully", {
          status: 200,
        });
      }

      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id,
      );

      if (!primaryEmail) {
        console.error("No primary email found for user");
        return new NextResponse("Error: No primary email found", {
          status: 400,
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { id: id as string },
      });

      if (existingUser) {
        console.log("User already exists:", existingUser);
        return new NextResponse("User already exists", { status: 200 });
      }

      // Create a user in database
      const newUser = await prisma.user.create({
        data: {
          id: id as string,
          email: primaryEmail.email_address,
          isSubscribed: false,
        },
      });

      console.log("New user created:", newUser);

      return new NextResponse("User created successfully", { status: 200 });
    } catch (error) {
      console.error("Error creating user in database:", error);
      return new NextResponse("Error: Failed to create user in database", {
        status: 500,
      });
    }
  }

  return new NextResponse("Webhook received successfully", { status: 200 });
}
