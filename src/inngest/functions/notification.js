import { inngest } from "../client";
import prisma from "../../../lib/prisma";
import { sendEmail } from "../../../lib/email";

export const sendOrderNotification = inngest.createFunction(
    { id: "send-order-notification" },
    { event: "notification/order.created" },
    async ({ event, step }) => {
        const { orderId, storeId } = event.data;

        // 1. Fetch data
        const { store, order } = await step.run("fetch-data", async () => {
            const store = await prisma.store.findUnique({
                where: { id: storeId },
                select: { userId: true, name: true, user: { select: { email: true } } }
            });

            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!store || !order) throw new Error("Store or Order not found");
            return { store, order };
        });

        if (!store.userId) return;

        // 2. Create In-App Notification
        await step.run("create-db-notification", async () => {
            await prisma.notification.create({
                data: {
                    userId: store.userId,
                    title: 'New Order Received',
                    message: `You have received a new order #${order.id} for ${store.name}. Total: ${order.total}`,
                    type: 'ORDER',
                    metadata: { orderId: order.id },
                },
            });
        });

        // 3. Send Email
        if (store.user?.email) {
            await step.run("send-email", async () => {
                await sendEmail({
                    to: store.user.email,
                    subject: `New Order #${order.id} - ${store.name}`,
                    html: `
            <h1>New Order Received!</h1>
            <p>Hello,</p>
            <p>You have received a new order <strong>#${order.id}</strong> on <strong>${store.name}</strong>.</p>
            <p><strong>Total Amount:</strong> ${order.total}</p>
            <p>Please check your dashboard for more details.</p>
            <br>
            <p>Best,<br>ShellSell Team</p>
          `,
                });
            });
        }

        return { success: true, orderId };
    }
);
