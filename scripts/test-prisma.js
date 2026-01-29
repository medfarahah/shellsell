const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Testing prisma client...');
    try {
        const products = await prisma.product.findMany({ take: 1 });
        console.log('Successfully fetched products:', products);
    } catch (e) {
        console.error('Error fetching products:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
