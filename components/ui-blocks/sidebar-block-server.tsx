import { getCategories } from "@/lib/api/server";
import { SidebarBlock } from "./sidebar-block";

interface SidebarBlockServerProps {
  id?: string;
  config?: {
    position?: "left" | "right";
    showCategories?: boolean;
    showFilters?: boolean;
  };
}

export async function SidebarBlockServer({ id, config }: SidebarBlockServerProps) {
  const categories = await getCategories().catch(() => []);
  return <SidebarBlock id={id} config={config} categories={categories} />;
}
