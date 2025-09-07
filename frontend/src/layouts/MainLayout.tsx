import { Outlet, Link } from "react-router-dom"
import Header from "./header"

export default function MainLayout() {
  return (
    <div>
      <Header/>
      <main>
        <Outlet /> {/* Aquí se mostrarán las páginas hijas*/}
      </main>
      <Footer/>
    
    </div>
  )
}
