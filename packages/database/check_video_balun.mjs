import { PrismaClient } from "./node_modules/.prisma/client/index.js";
const prisma = new PrismaClient();
prisma.product.findMany({where: {name: {contains: 'Video Balun', mode: 'insensitive'}}, select: {name: true, isPublished: true, isService: true, stock: true, id: true}}).then(res => { console.log(res); prisma.$disconnect() });
