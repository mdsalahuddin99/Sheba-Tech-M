import { Metadata } from "next";
import { prisma } from "@/server/db/client";
import { SystemUpdatesClient } from "./SystemUpdatesClient";

export const metadata: Metadata = {
  title: "Update Management",
  description: "Manage system updates and release notes.",
};

export default async function SystemUpdatesPage() {
  const updates = await prisma.systemUpdate.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div className="w-full h-full pb-8">
      <SystemUpdatesClient initialUpdates={updates} />
    </div>
  );
}
