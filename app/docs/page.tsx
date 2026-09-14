import { redirect } from "next/navigation";
import { getFirstDocSlug } from "@/lib/docs";

export default function DocsIndex() {
  redirect(`/docs/${getFirstDocSlug()}`);
}
