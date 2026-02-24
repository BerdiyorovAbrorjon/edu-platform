import Link from "next/link";
import { Zap, CheckCircle } from "lucide-react";

const features = [
  "Video va matnli darslar",
  "Bilimni baholash testlari",
  "Real vaqtda progress kuzatish",
  "Vaziyatli savol-javoblar",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[45%] flex-col bg-[#030712]">
        {/* Orbs */}
        <div className="lp-glow pointer-events-none absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="lp-glow lp-d500 pointer-events-none absolute -right-20 bottom-1/4 h-[400px] w-[400px] rounded-full bg-violet-600/20 blur-[90px]" />
        <div className="lp-grid pointer-events-none absolute inset-0" />
        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030712] to-transparent" />

        {/* Top logo */}
        <div className="relative z-10 p-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Akme-pedagog</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12 text-center">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-2xl shadow-blue-500/30">
            <Zap className="h-10 w-10 text-white" />
          </div>

          <h2 className="mb-4 text-4xl font-black tracking-tight text-white">
            Bilimingizni
            <br />
            <span className="lp-shimmer-text">Oshiring.</span>
          </h2>
          <p className="mb-10 max-w-xs text-lg text-slate-400">
            4 bosqichli o&apos;qish tizimi bilan professional darajaga erishing
          </p>

          <div className="w-full max-w-xs space-y-3 text-left">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                  <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                </div>
                <span className="text-sm text-slate-300">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 p-8 text-center text-xs text-slate-700">
          © 2024 Akme-pedagog. Barcha huquqlar himoyalangan.
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-16">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Akme-pedagog
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
