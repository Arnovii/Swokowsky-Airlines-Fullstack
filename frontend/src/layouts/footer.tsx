export default function Footer() {
  return (
    <footer className="bg-[#081225] text-white py-8 font-sans">
      {/* Línea inferior */}
      <div className="mt-6 border-t border-white/10 pt-4 text-center text-sm text-gray-400 font-sans">
        © {new Date().getFullYear()} Swokowsky Airlines. Todos los derechos reservados.
        <br />
      </div>
    </footer>
  );
}