import { inngest } from "../client";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendReviewNotification = inngest.createFunction(
    { id: "send-review-notification" },
    { event: "shop/review.submitted" },
    async ({ event, step }) => {
        const { orderId, reviewText, rating, productName, sellerEmail } = event.data;

        // Send email using Resend
        await step.run("send-email-resend", async () => {
            if (!sellerEmail) {
                throw new Error("No seller email provided in event data");
            }

            const { data, error } = await resend.emails.send({
                from: 'ShellSell Reviews <reviews@resend.dev>', // User needs to configure domain
                to: [sellerEmail],
                subject: `New Review for ${productName}`,
                html: `
                <h1>New Review Received</h1>
                <p><strong>Product:</strong> ${productName}</p>
                <p><strong>Rating:</strong> ${rating} / 5</p>
                <p><strong>Review:</strong></p>
                <blockquote>${reviewText}</blockquote>
                <p>Order ID: ${orderId}</p>
            `,
            });

            if (error) {
                throw new Error(`Failed to send email: ${error.message}`);
            }

            return data;
        });

        return { success: true };
    }
);
