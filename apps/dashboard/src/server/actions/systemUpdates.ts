"use server";

import { prisma } from "@/server/db/client";
import { revalidatePath } from "next/cache";

export async function createSystemUpdate(data: {
  version: string;
  date: string;
  features: string[];
}) {
  await prisma.systemUpdate.create({
    data: {
      version: data.version,
      date: new Date(data.date),
      features: data.features,
    },
  });

  revalidatePath("/", "layout");
}

export async function deleteSystemUpdate(id: string) {
  await prisma.systemUpdate.delete({
    where: { id },
  });

  revalidatePath("/", "layout");
}
