import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 rounded-xl bg-navy px-5 py-3">
        <Logo />
      </div>
      <div className="w-full max-w-md rounded-card border border-line bg-white p-6 shadow-card sm:p-8">
        {children}
      </div>
    </main>
  );
}
