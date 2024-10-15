import { EmailTemplate } from "@/app/emails/welcome";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import sgMail from "@sendgrid/mail";

export async function POST(request: NextRequest) {
  try {
    // Extract the required fields from the request body
    const { to, subject, emailContent } = await request.json();

    // Check if all required fields are provided
    if (!to || !subject || !emailContent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const from = process.env.SENDGRID_FROM_EMAIL as string;
    // Prepare the email message
    const msg = {
      to,
      from,
      subject,
      // text: "This is a fallback text version of the email.",
      html: emailContent,
    };

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

    // Send the email via SendGrid
    const response = await sgMail.send(msg);

    // Return a success response with the status code
    return NextResponse.json(
      {
        message: "Email sent successfully",
        statusCode: response[0].statusCode,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log the error and return a failure response
    console.error("Error sending email:", error);

    return NextResponse.json(
      { error: "Failed to send email", details: error },
      { status: 500 }
    );
  }
}

// http://localhost:3001/bafkreihh7c75txi6vxpultp73w2ljpjup7wagfpr6ubsdmgylgfi3qjxj4
