type Props = { children: React.ReactNode };

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* efectos de partículas y círculos */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>

      {/* caja */}
      {children}
    </div>
  );
}
