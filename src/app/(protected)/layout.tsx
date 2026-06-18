import { ProtectedLayout } from "@/components/shared/ProtectedLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
