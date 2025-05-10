import Header from "@/components/layout/header";

export default function DateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="relative">{children}</main>
    </div>
  );
}
