import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import FloatingSupportButton from "../components/FloatingSupportButton";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 mt-[80px]"> {/* Agrega un margen superior igual a la altura del header */}
        <Outlet />
      </main>
      <Footer />
      
      {/* Botón flotante de soporte */}
      <FloatingSupportButton />
    </div>
  );
}
