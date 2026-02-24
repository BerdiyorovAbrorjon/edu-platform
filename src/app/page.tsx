import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { HeroCta } from "@/components/landing/hero-cta";
import {
  CheckCircle,
  BookOpen,
  TrendingUp,
  Zap,
  ArrowRight,
  Users,
  Trophy,
  Star,
} from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;
  const dashboardHref =
    session?.user.role === "ADMIN" ? "/admin/lessons" : "/student/lessons";

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      {/* ─── NAVBAR ─── */}
      <header className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Akme-pedagog</span>
          </Link>

          {isLoggedIn ? (
            <Button
              asChild
              size="sm"
              className="rounded-full bg-white text-gray-900 hover:bg-gray-100 gap-1.5 font-medium"
            >
              <Link href={dashboardHref}>
                Platformaga Kirish
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full border border-white/10 text-white/90 hover:bg-white/5 hover:text-white"
            >
              <Link href="/login">Kirish</Link>
            </Button>
          )}
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030712] pt-16">
        {/* Background orbs */}
        <div className="lp-glow pointer-events-none absolute -left-48 top-16 h-[650px] w-[650px] rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="lp-glow lp-d500 pointer-events-none absolute -right-48 bottom-16 h-[550px] w-[550px] rounded-full bg-violet-600/22 blur-[110px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[90px]" />
        <div className="lp-glow lp-d300 pointer-events-none absolute right-1/4 top-1/4 h-[250px] w-[250px] rounded-full bg-pink-600/10 blur-[80px]" />

        {/* Dot grid */}
        <div className="lp-grid pointer-events-none absolute inset-0" />

        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-[#030712] to-transparent" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          {/* Animated badge */}
          <div className="lp-fade-up mb-8 inline-flex items-center gap-2.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            <span className="text-sm font-medium text-blue-300">
              Yangi — 4 bosqichli o&apos;qish tizimi
            </span>
          </div>

          {/* Main heading */}
          <h1 className="lp-fade-up lp-d100 mb-6 leading-none tracking-tighter text-white">
            <span className="block text-6xl font-black sm:text-7xl md:text-[88px]">
              Bilimingizni
            </span>
            <span className="lp-shimmer-text block text-6xl font-black sm:text-7xl md:text-[88px]">
              Oshiring.
            </span>
            <span className="mt-2 block text-3xl font-bold text-slate-400 sm:text-4xl md:text-5xl">
              Professional Darajaga.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="lp-fade-up lp-d200 mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
            Video darslar, testlar va amaliy vazifalar bilan yangi
            ko&apos;nikmalarni egallang. O&apos;z tempingizda, qulay vaqtda
            o&apos;rganing.
          </p>

          {/* CTA buttons */}
          <div className="lp-fade-up lp-d300">
            <HeroCta isLoggedIn={isLoggedIn} dashboardHref={dashboardHref} />
          </div>

          {/* Stats row */}
          <div className="lp-fade-up lp-d500 mt-20 border-t border-white/[0.07] pt-10">
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {[
                { value: "1,200+", label: "Faol o\u02BBquvchilar" },
                { value: "50+", label: "Darslar" },
                { value: "95%", label: "Muvaffaqiyat" },
                { value: "4.9\u2605", label: "Reyting" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-black text-white">
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/10 pt-1.5">
            <div className="lp-scroll-dot h-1.5 w-1 rounded-full bg-white/30" />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-white px-6 py-32">
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <div className="mb-20 text-center">
            <span className="mb-4 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
              Qanday Ishlaydi
            </span>
            <h2 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              3 qadam.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Yangi bilim.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-gray-500">
              Oddiy va samarali jarayon bilan yangi ko&apos;nikmalarni tez
              egallang
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: <CheckCircle className="h-7 w-7 text-blue-600" />,
                iconBg: "bg-blue-50",
                title: "Test Boshlang",
                desc: "Dastlabki bilim darajangizni aniqlang. Qisqa test orqali qaysi mavzularni o\u02BBlashtirishingiz kerakligini bilib oling.",
                hoverBorder: "hover:border-blue-200",
                hoverShadow: "hover:shadow-blue-100/80",
              },
              {
                step: "02",
                icon: <BookOpen className="h-7 w-7 text-violet-600" />,
                iconBg: "bg-violet-50",
                title: "Darslarni O\u02BBrganing",
                desc: "Video va matnli materiallar bilan yangi bilimlarni o\u02BBzlashtirib boring. Har bir dars interaktiv va tushunarli formatda.",
                hoverBorder: "hover:border-violet-200",
                hoverShadow: "hover:shadow-violet-100/80",
              },
              {
                step: "03",
                icon: <TrendingUp className="h-7 w-7 text-pink-600" />,
                iconBg: "bg-pink-50",
                title: "Natijani Ko\u02BBring",
                desc: "Real vaqtda o\u02BBsishingizni kuzating. Testlar orqali bilimingizni mustahkamlang va sertifikat oling.",
                hoverBorder: "hover:border-pink-200",
                hoverShadow: "hover:shadow-pink-100/80",
              },
            ].map((f) => (
              <div
                key={f.step}
                className={`group relative overflow-hidden rounded-3xl border-2 border-gray-100 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${f.hoverBorder} ${f.hoverShadow}`}
              >
                {/* Decorative large step number */}
                <div className="pointer-events-none absolute -right-3 -top-6 select-none text-[9rem] font-black leading-none text-gray-50">
                  {f.step}
                </div>

                {/* Icon */}
                <div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${f.iconBg}`}
                >
                  {f.icon}
                </div>

                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {f.title}
                </h3>
                <p className="leading-relaxed text-gray-500">{f.desc}</p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Boshlash <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS BAND ─── */}
      <section className="relative overflow-hidden bg-slate-950 px-6 py-24">
        <div className="lp-grid pointer-events-none absolute inset-0" />
        {/* Orb accent */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/8 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="mb-12 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            Natijalar o&apos;z-o&apos;zidan gapiradi
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                icon: <Users className="h-6 w-6 text-blue-400" />,
                value: "1,200+",
                label: "O\u02BBquvchilar",
              },
              {
                icon: <BookOpen className="h-6 w-6 text-violet-400" />,
                value: "50+",
                label: "Darslar",
              },
              {
                icon: <Trophy className="h-6 w-6 text-amber-400" />,
                value: "95%",
                label: "Muvaffaqiyat",
              },
              {
                icon: <Star className="h-6 w-6 text-pink-400" />,
                value: "4.9/5",
                label: "Reyting",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 text-center transition-colors duration-300 hover:bg-white/[0.07]"
              >
                {s.icon}
                <div className="text-4xl font-black text-white">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative overflow-hidden px-6 py-36">
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-pink-600" />
        <div className="lp-grid pointer-events-none absolute inset-0 opacity-25" />
        {/* Orbs on top */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <Zap className="h-4 w-4" />
            Bepul boshlang — Hoziroq
          </div>

          <h2 className="mt-4 text-5xl font-black tracking-tighter text-white md:text-6xl lg:text-7xl">
            Bugun Bepul
            <br />
            Boshlang
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-xl text-white/65">
            Hoziroq ro&apos;yxatdan o&apos;ting va birinchi darsni yakunlang.
            Karta yoki to&apos;lov talab qilinmaydi.
          </p>

          <div className="mt-10">
            <HeroCta
              isLoggedIn={isLoggedIn}
              dashboardHref={dashboardHref}
              variant="cta"
            />
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.06] bg-[#030712] px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">Akme-pedagog</span>
          </Link>
          <p className="text-sm text-slate-600">
            © 2024 Akme-pedagog. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </footer>
    </div>
  );
}
