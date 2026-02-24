export default function CanhoesPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="canhoes" className="min-h-[100svh] bg-gradient-to-b from-emerald-950/35 via-background to-background">
      {children}
    </div>
  );
}
