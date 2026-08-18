import { PrismaClient } from "./node_modules/.prisma/client/index.js";
const prisma = new PrismaClient();
prisma.product.findFirst({ select: { id: true, isService: true } }).then(res => { console.log("Success:", res); process.exit(0); }).catch(e => { console.error("Error:", e.message); process.exit(1); });
