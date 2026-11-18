"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getCategories(type?: "INCOME" | "EXPENSE") {
  const session = await getSession();
  if (!session) return [];

  return prisma.category.findMany({
    where: {
      userId: session.userId,
      ...(type ? { type } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(formData: unknown) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  const parsed = categorySchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Data kategori tidak valid" };
  }

  const { name, type, icon, color } = parsed.data;

  try {
    const category = await prisma.category.create({
      data: {
        userId: session.userId,
        name,
        type,
        icon,
        color,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: true, category };
  } catch (error) {
    console.error("Create category error:", error);
    return { error: "Gagal membuat kategori baru." };
  }
}

export async function updateCategory(id: string, formData: unknown) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  const parsed = categorySchema.partial().safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Data kategori tidak valid" };
  }

  try {
    const existing = await prisma.category.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) return { error: "Kategori tidak ditemukan." };

    await prisma.category.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update category error:", error);
    return { error: "Gagal memperbarui kategori." };
  }
}

export async function deleteCategory(id: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  try {
    const existing = await prisma.category.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) return { error: "Kategori tidak ditemukan." };

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { error: "Gagal menghapus kategori." };
  }
}

