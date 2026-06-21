import { LoginForm } from "@/components/auth/LoginForm";
import { Leaf } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background [.light_&]:bg-[#EAF3C4] px-4">
      <div className="mb-8 flex items-center gap-2">
        <Leaf className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">GreenConnect</span>
      </div>
      <LoginForm />
    </div>
  );
}
