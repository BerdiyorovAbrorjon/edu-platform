export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">Edu Platform</h1>
      <p className="text-lg text-muted-foreground">
        Welcome to the educational platform
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
        >
          Sign In
        </a>
        <a
          href="/register"
          className="rounded-md border px-6 py-3 hover:bg-muted"
        >
          Register
        </a>
      </div>
    </div>
  );
}
