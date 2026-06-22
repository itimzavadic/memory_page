import { redirect } from "next/navigation";

export default function NewMemorialPage() {
  redirect("/admin/memorials/create");
}
