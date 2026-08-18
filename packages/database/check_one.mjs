import { PrismaClient } from "./node_modules/.prisma/client/index.js";
const prisma = new PrismaClient();
prisma.product.findUnique({where: {id: 'cmrx876y10003jv04fhsavoe3'}}).then(p => { console.log("isService:", p.isService, "isPublished:", p.isPublished, "stock:", p.stock); prisma.$disconnect() });
