// @ts-expect-error: Next.js 15 requires special types that conflict with TypeScript's checking
export default function BookLayout({ children }) {
  return (
    <div className="min-h-screen bg-black">
      <main className="relative">{children}</main>
    </div>
  );
}
