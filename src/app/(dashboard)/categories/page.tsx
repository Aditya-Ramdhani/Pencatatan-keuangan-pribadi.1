import { getCategories } from "@/actions/categories";
import { CategoryManagementView } from "@/components/categories/CategoryManagementView";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return <CategoryManagementView categories={categories} />;
}

