import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const brandsData = [
  {"id":"cmr6joqt70000uevkn6xwy11z","name":"Non-Brand","createdAt":"2026-07-04T15:56:37.435Z"},
  {"id":"cmr6josbx0001uevk1ic3vkyk","name":"Dahua","createdAt":"2026-07-04T15:56:39.406Z"},
  {"id":"cmr6jotdc0002uevkeqrvgc5l","name":"CSX","createdAt":"2026-07-04T15:56:40.752Z"},
  {"id":"cmr6jouit0003uevkn869r4sf","name":"China","createdAt":"2026-07-04T15:56:42.246Z"},
  {"id":"cmr6jovob0004uevk85mm3a5e","name":"3NK","createdAt":"2026-07-04T15:56:43.739Z"},
  {"id":"cmr6jowuv0005uevks2vtpa20","name":"Imou","createdAt":"2026-07-04T15:56:45.272Z"},
  {"id":"cmr6joxx70006uevkyc3jt06e","name":"EZVIZ","createdAt":"2026-07-04T15:56:46.651Z"},
  {"id":"cmr6joyyq0007uevk341qdfl3","name":"Hikvision","createdAt":"2026-07-04T15:56:48.003Z"},
  {"id":"cmr6jp0wx0008uevkiixzgkqv","name":"JOVISION","createdAt":"2026-07-04T15:56:50.529Z"},
  {"id":"cmr6jp2ci0009uevkd0y0n7lc","name":"MAXLINK","createdAt":"2026-07-04T15:56:52.386Z"},
  {"id":"cmr6jp3j6000auevkc9g1wln6","name":"NTS","createdAt":"2026-07-04T15:56:53.922Z"},
  {"id":"cmr6jp4pu000buevkv5fp7s9w","name":"TOSHIBA","createdAt":"2026-07-04T15:56:55.459Z"},
  {"id":"cmr6jp5vx000cuevk0mws2hoc","name":"Ruijie","createdAt":"2026-07-04T15:56:56.974Z"},
  {"id":"cmr6jp736000duevkyy1zd2jk","name":"Netis","createdAt":"2026-07-04T15:56:58.531Z"},
  {"id":"cmr6jp95q000euevkws0mu4ih","name":"IPSHITA GQ","createdAt":"2026-07-04T15:57:01.214Z"},
  {"id":"cmr6jpaen000fuevkydxxknv4","name":"Mercusys","createdAt":"2026-07-04T15:57:02.831Z"},
  {"id":"cmr6jpbkb000guevkvrnpm23l","name":"islamia bd","createdAt":"2026-07-04T15:57:04.332Z"},
  {"id":"cmr6jpcqx000huevku78jgwz8","name":"TP-Link","createdAt":"2026-07-04T15:57:05.865Z"},
  {"id":"cmr6jpe77000iuevknee7dbac","name":"MME","createdAt":"2026-07-04T15:57:07.747Z"},
  {"id":"cmr6jpfdv000juevka3nyliki","name":"JVCO","createdAt":"2026-07-04T15:57:09.284Z"},
  {"id":"cmr6jpgid000kuevk9oh8frm6","name":"STAREX","createdAt":"2026-07-04T15:57:10.742Z"},
  {"id":"cmr6jphoe000luevkmiwsyp3c","name":"EZADP","createdAt":"2026-07-04T15:57:12.254Z"},
  {"id":"cmr6jpisu000muevkeimq0yxl","name":"CCD","createdAt":"2026-07-04T15:57:13.711Z"},
  {"id":"cmr6jpjue000nuevkjzssyol7","name":"DBC Hipower","createdAt":"2026-07-04T15:57:15.063Z"},
  {"id":"cmr6jpkvo000ouevkmzttcmwh","name":"298","createdAt":"2026-07-04T15:57:16.405Z"},
  {"id":"cmr6jpm2m000puevkzwc1jb2o","name":"CDATA","createdAt":"2026-07-04T15:57:17.951Z"},
  {"id":"cmr6jpn6j000quevkn5y6pns9","name":"SZADP","createdAt":"2026-07-04T15:57:19.387Z"},
  {"id":"cmr7mufzt0000jj04quierwo7","name":"B999","createdAt":"2026-07-05T10:12:48.378Z"},
  {"id":"cmr8r2mo30000kz049970sx43","name":"Seagate","createdAt":"2026-07-06T04:58:54.916Z"},
  {"id":"cmr8s3qy30000kz04ep3k4u8u","name":"SIKO","createdAt":"2026-07-06T05:27:46.731Z"},
  {"id":"cmraierts0004l2046l9wlsj8","name":"Technician","createdAt":"2026-07-07T10:31:57.281Z"},
  {"id":"cmrhis9xv0000lc04bqbiv1pi","name":"Tenda","createdAt":"2026-07-12T08:16:50.515Z"},
  {"id":"cmrkaelkm0002ih04h8xr684a","name":"LG","createdAt":"2026-07-14T06:45:34.007Z"},
  {"id":"cmrkca9kt0000i504u93dqpf6","name":"WD","createdAt":"2026-07-14T07:38:11.069Z"},
  {"id":"cmrm50csk0000jy045lokfk68","name":"UNIT","createdAt":"2026-07-15T13:50:03.716Z"},
  {"id":"cmrrmrff10000la04rbgn23kd","name":"ELINK","createdAt":"2026-07-19T10:05:51.181Z"},
  {"id":"cms3hfqox0002l704q3e5adjf","name":"HPC","createdAt":"2026-07-27T17:10:01.953Z"},
  {"id":"cms3hlrga0000l3043eni2evt","name":"Micropack","createdAt":"2026-07-27T17:14:42.874Z"}
];

async function main() {
  console.log(`Importing ${brandsData.length} brands...`);
  try {
    const result = await prisma.brand.createMany({
      data: brandsData,
      skipDuplicates: true
    });
    console.log(`Successfully imported ${result.count} brands.`);
  } catch (error) {
    console.error("Failed to import brands:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
