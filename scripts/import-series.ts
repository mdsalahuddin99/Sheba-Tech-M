import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seriesData = [{"id":"cmr6jsdt10031uevk66ptgubj","name":"Black","createdAt":"2026-07-04 15:59:27.206"},{"id":"cmr6jsfpq0032uevkflq157fz","name":"Metal Black","createdAt":"2026-07-04 15:59:29.678"},{"id":"cmr6jsgv70033uevkjpa9l1ll","name":"Hybrid Light","createdAt":"2026-07-04 15:59:31.171"},{"id":"cmr6jsi0u0034uevk3kfx7r5j","name":"TWT","createdAt":"2026-07-04 15:59:32.671"},{"id":"cmr6jsj1z0035uevk3c7mbl4l","name":"100P Pot","createdAt":"2026-07-04 15:59:34.008"},{"id":"cmr6jsk4i0036uevkmyj5yyuf","name":"Unmannaged PoE","createdAt":"2026-07-04 15:59:35.395"},{"id":"cmr6jsl7c0037uevkeh64e5q4","name":"White","createdAt":"2026-07-04 15:59:36.793"},{"id":"cmr6jsmaq0038uevk3ywp18cv","name":"White Plastic","createdAt":"2026-07-04 15:59:38.21"},{"id":"cmr6jsndw0039uevkwnfk5e82","name":"5Ghz","createdAt":"2026-07-04 15:59:39.62"},{"id":"cmr6jsogo003auevkvw9ef75e","name":"Pro","createdAt":"2026-07-04 15:59:41.017"},{"id":"cmr6jspim003buevk6ed5wlae","name":"Indoor","createdAt":"2026-07-04 15:59:42.383"},{"id":"cmr6jsqv6003cuevkxiurdaji","name":"Outdoor","createdAt":"2026-07-04 15:59:44.131"},{"id":"cmr6jsrx3003duevk2oalftj6","name":"12V1A","createdAt":"2026-07-04 15:59:45.495"},{"id":"cmr6jsszl003euevke1jcjhx0","name":"Srv","createdAt":"2026-07-04 15:59:46.881"},{"id":"cmr6jsu0y003fuevko90zylkr","name":"C10","createdAt":"2026-07-04 15:59:48.226"},{"id":"cmr6jsv52003guevkqegp4x1p","name":"PoE","createdAt":"2026-07-04 15:59:49.67"},{"id":"cmr6jsw6b003huevk7k14jxfn","name":"S45C","createdAt":"2026-07-04 15:59:51.011"},{"id":"cmr6jsx97003iuevk05fjmr1h","name":"DS-7600","createdAt":"2026-07-04 15:59:52.411"},{"id":"cmr6jsycs003juevk5a7bervn","name":"RFB","createdAt":"2026-07-04 15:59:53.836"},{"id":"cmr6jszjo003kuevkkvyo5s6l","name":"Matel Black","createdAt":"2026-07-04 15:59:55.38"},{"id":"cmr6jt0kz003luevkhbunhil5","name":"PC","createdAt":"2026-07-04 15:59:56.723"},{"id":"cmr6jt1m6003muevkajdsaey2","name":"Reyee","createdAt":"2026-07-04 15:59:58.063"},{"id":"cmr6jt2vy003nuevkjpywxrpm","name":"2.4Ghz","createdAt":"2026-07-04 15:59:59.711"},{"id":"cmr6jt3x8003ouevkpwygv6aq","name":"3K","createdAt":"2026-07-04 16:00:01.053"},{"id":"cmr6jt51o003puevkzwn0y2md","name":"3.0 AI","createdAt":"2026-07-04 16:00:02.508"},{"id":"cmr6jt63j003quevke96xg6v6","name":"baind book","createdAt":"2026-07-04 16:00:03.871"},{"id":"cmr6jt75g003ruevkuflwp36d","name":"Non-Voice","createdAt":"2026-07-04 16:00:05.237"},{"id":"cmr6jt8bf003suevkng42rfk9","name":"Wireless","createdAt":"2026-07-04 16:00:06.748"},{"id":"cmr6jt9fz003tuevkz6j9tafd","name":"1Ge","createdAt":"2026-07-04 16:00:08.208"},{"id":"cmr6jtahb003uuevksa4dmnfo","name":"III","createdAt":"2026-07-04 16:00:09.552"},{"id":"cmr6jtbk2003vuevkdqsgbj94","name":"Orange","createdAt":"2026-07-04 16:00:10.946"},{"id":"cmr6jtcla003wuevkfvo7n11k","name":"Metal","createdAt":"2026-07-04 16:00:12.287"},{"id":"cmr6jtdou003xuevk9agew0d9","name":"DVR/NVR","createdAt":"2026-07-04 16:00:13.711"},{"id":"cmr6jtf14003yuevkw9pzzan5","name":"Weatherproof","createdAt":"2026-07-04 16:00:15.449"},{"id":"cmr6jtg2x003zuevk590uod86","name":"IL","createdAt":"2026-07-04 16:00:16.81"},{"id":"cmr6jth6w0040uevkcjstowxa","name":"WizSense","createdAt":"2026-07-04 16:00:18.248"},{"id":"cmr6jtico0041uevkay61mg3a","name":"Dual","createdAt":"2026-07-04 16:00:19.752"},{"id":"cmr6jtjgh0042uevk03ku0o8s","name":"XPON","createdAt":"2026-07-04 16:00:21.185"},{"id":"cmr6jtkkz0043uevkg6qdzfl6","name":"Yellow","createdAt":"2026-07-04 16:00:22.643"},{"id":"cmr7n4f6e0001js04ufddw13d","name":"Outdoor Box","createdAt":"2026-07-05 10:20:33.879"},{"id":"cmr8r5enz0002kz04zm4a1fto","name":"Desktop","createdAt":"2026-07-06 05:01:04.512"},{"id":"cmr8s5cd10002kz0474jk3zex","name":"Frameless","createdAt":"2026-07-06 05:29:01.141"},{"id":"cmr8ttcbl0004l104g950b771","name":"4K Black","createdAt":"2026-07-06 06:15:40.45"},{"id":"cmra4hlwi0000jr04hc85rvk9","name":"4K","createdAt":"2026-07-07 04:02:14.946"},{"id":"cmrd5llpa0002ky04l4cyn3wf","name":"M1/T","createdAt":"2026-07-09 06:56:39.455"},{"id":"cmrd6yapl0001jr04mdr46pnp","name":"50pack","createdAt":"2026-07-09 07:34:31.354"},{"id":"cmri3mgjn0001i804mvisqlf4","name":"PC P300","createdAt":"2026-07-12 18:00:11.075"},{"id":"cmrkaim9t0004ih04gp3mc7mp","name":"Laptop","createdAt":"2026-07-14 06:48:41.537"},{"id":"cmrucnmjb0001kz042ytob37m","name":"Purple","createdAt":"2026-07-21 07:46:16.152"},{"id":"cmrud4n9t0002jp04d3ye59x4","name":"Bullet","createdAt":"2026-07-21 07:59:30.257"},{"id":"cmrudag830001la04vo6p391n","name":"Dome","createdAt":"2026-07-21 08:04:01.059"}].map(item => ({
  ...item,
  createdAt: item.createdAt.replace(" ", "T") + "Z"
}));

async function main() {
  console.log(`Importing ${seriesData.length} series...`);
  try {
    const result = await prisma.series.createMany({
      data: seriesData,
      skipDuplicates: true
    });
    console.log(`Successfully imported ${result.count} series.`);
  } catch (error) {
    console.error("Failed to import series:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
