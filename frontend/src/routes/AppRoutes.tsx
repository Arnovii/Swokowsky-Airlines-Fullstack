import { Routes, Route } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import Home from "../modules/home/pages/Home"
import Perfil from "../modules/user_profile/pages/Perfil"
import Login from "../modules/auth/pages/Login"
import Register from "../modules/auth/pages/Register"
import ForgotPassword from "../modules/auth/pages/ForgotPassword"
import NotFound from "../modules/error/pages/NotFound"
import { FlightSearchResults } from "../modules/flightsearch/pages/FlightSearchResults";
import News from "../modules/news/pages/News"
import DetalleOferta from "../modules/news/pages/detalleoferta"
import DetalleVuelo from "../modules/news/pages/detallevuelo"
import PanelAdministrador from "../modules/panelAdministrador/pages/PanelAdministrador"
import PrivateRoute from "./PrivateRoute"
import AdminRoute from "./AdminRoute"


export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas principales con header/footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/perfil"
          element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          } />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/buscar-vuelos" element={<FlightSearchResults />} />
        <Route path="/news" element={<News />} />
        <Route path="/noticias/oferta/:id" element={<DetalleOferta />} />
        <Route path="/noticias/vuelo/:id" element={<DetalleVuelo />} />
        <Route path="/panelAdministrador"
          element={
            <AdminRoute>
              <PanelAdministrador />
            </AdminRoute>
          } />
      </Route>

      {/* Página 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
