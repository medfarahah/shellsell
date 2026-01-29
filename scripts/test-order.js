const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Testing order creation...');
    try {
        const order = await prisma.order.create({
            data: {
                total: 993,
                userId: "user_38tLufIbMK8LqA2VDsu8YHeWfMh",
                storeId: "cmky920vt0003jicvru7nkf7s",
                addressId: "cmkynrj0l000fmp5j2vbz4l11",
                isPaid: false,
                paymentMethod: "COD",
                isCouponUsed: false,
                coupon: {},
                orderItems: {
                    create: [
                        {
                            productId: "cmkyvqv6w0001q0iwp5c8nhgr",
                            quantity: 1,
                            price: 993,
                            selectedColor: "black",
                            selectedSize: "L"
                        }
                    ]
                }
            }
        });
        console.log('Successfully created order:', order);
    } catch (e) {
        console.error('Error creating order:');
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
