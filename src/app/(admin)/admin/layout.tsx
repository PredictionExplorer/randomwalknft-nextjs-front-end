import { requireSession } from "@/lib/auth/session";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireSession();
  return children;
}
