import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
prisma.product.findMany({ where: { OR: [{ isService: true }, { stock: { gt: 0 } }] } }).then(res => { console.log("Success"); process.exit(0); }).catch(e => { console.error("Error:", e.message); process.exit(1); });
