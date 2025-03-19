import { createClient } from "@/utils/supabase/server";

export async function getMagicLink(email: string): Promise<string | null> {
    try {
        const supabase = await createClient();

        console.log("Email:", email);

        // Step 2: Request a Magic Link
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            },
        });

        const otpMatch = getOtpFromInbucket(email);


        console.log("Supabase Response:", data);

        if (error) {
            console.error("Error generating magic link:", error);
            return null;
        }

        // Return the magic link instead of session
        return otpMatch;
    } catch (error) {
        console.error("Unexpected error generating magic link:", error);
        return null;
    }
}

export async function getOtpFromInbucket(email: string): Promise<string | null> {
    try {
        const mailbox = encodeURIComponent(email.split("@")[0]); // Extract and encode mailbox name

        // Step 1: Fetch the latest emails from Inbucket
        const response = await fetch(`http://localhost:54324/api/v1/mailbox/${mailbox}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const emails = await response.json();

        if (!emails || emails.length === 0) {
            console.error("No emails found for mailbox:", email);
            return null;
        }

        // Step 2: Get the latest email ID
        const latestEmailId = emails[0].id; // Pick the most recent email
        console.log("Latest Email ID:", latestEmailId);

        // Step 3: Fetch the full email content
        const emailResponse = await fetch(`http://localhost:54324/api/v1/mailbox/${mailbox}/${latestEmailId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const emailContent = await emailResponse.json();

        if (!emailContent.body || (!emailContent.body.text && !emailContent.body.html)) {
            console.error("Email body not found.");
            return null;
        }



        // Step 4: Extract the OTP using regex
        const otpMatch =
            emailContent.body.text.match(/\b\d{6}\b/) || // Looks for a 6-digit number
            emailContent.body.html.match(/\b\d{6}\b/);

        console.log("OTP Match:", otpMatch[0]);

        if (!otpMatch) {
            console.error("OTP not found in email body.");
            return null;
        }

        return otpMatch[0]; // Return the extracted OTP code
    } catch (error) {
        console.error("Error retrieving OTP from Inbucket:", error);
        return null;
    }
}





