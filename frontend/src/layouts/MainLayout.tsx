import { Outlet, Link } from "react-router-dom"

export default function MainLayout() {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Inicio</Link> |{" "}
          <Link to="/perfil">Perfil</Link> |{" "}
          <Link to="/login">Login</Link> |{" "}
          <Link to="/registro">Registro</Link> |{" "}
          <Link to="/forgot-password">Olvidé contraseña</Link>
        </nav>
      </header>

      <main>
        <Outlet /> {/* Aquí se mostrarán las páginas hijas*/}
      </main>

      <footer>
        <p>SOY UN FOOTER PROVISIONAL PUESTO EN MainLayout.tsx </p>
      </footer>
    </div>
  )
}
