import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../modules/home/pages/Home";
import Perfil from "../modules/user_profile/pages/Perfil";
import Login from "../modules/auth/pages/Login";
import Register from "../modules/auth/pages/Register";
import ResetPassword from "../modules/auth/pages/ResetPassword";
import ForgotPassword from "../modules/auth/pages/ForgotPassword";
import NotFound from "../modules/error/pages/NotFound";
import { FlightSearchResults } from "../modules/flightsearch/pages/FlightSearchResults";
import DetalleOferta from "../modules/news/pages/detalleoferta"
import DetalleVuelo from "../modules/news/pages/detallevuelo"
import PanelAdministrador from "../modules/panelAdministrador/pages/PanelAdministrador"
import PrivateRoute from "./PrivateRoute"
import AdminRoute from "./AdminRoute"
import ClientRoute from "./ClientRoute" 
import CheckoutPage from '../modules/checkout/page/CheckoutPage';
import News from "../modules/news/pages/News"
import CrearVueloPage from "../modules/panelAdministrador/pages/CrearVueloPage";
import EditarVueloPage from "../modules/panelAdministrador/pages/EditarVueloPage";
import Carrito from "../modules/carrito/page/Carrito";
import Root from "../modules/panelAdministrador/pages/Root";
import ChangePassword from "../modules/auth/pages/ChangePassword";
import CreateAdmin from "../modules/panelAdministrador/pages/CreateAdmin";
import TicketPage from "../modules/user_profile/pages/TicketPage";




export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          }
        />

        <Route path="/tickets" element={<TicketPage />} />

        {/* Ruta protegida del carrito */}
        <Route
          path="/carrito"
          element={
            <ClientRoute>
              <Carrito />
            </ClientRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ClientRoute>
              <CheckoutPage />
            </ClientRoute>
          }
        />

        {/* Auth públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Vuelos y noticias */}
        <Route path="/buscar-vuelos" element={<FlightSearchResults />} />
        <Route path="/news" element={<News />} />
        <Route path="/noticias/oferta/:id" element={<DetalleOferta />} />
        <Route path="/noticias/vuelo/:id" element={<DetalleVuelo />} />

        {/* Panel Admin */}
        <Route
          path="/panelAdministrador"
          element={
            <AdminRoute>
              <PanelAdministrador />
            </AdminRoute>
          }
        />
        <Route
          path="/panelAdministrador/crear-vuelo"
          element={
            <AdminRoute>
              <CrearVueloPage />
            </AdminRoute>
          }
        />
        <Route 
          path="/panelAdministrador/editar-vuelo/:id"
          element={
            <AdminRoute>
              <EditarVueloPage />
            </AdminRoute>
          }
        />
      </Route>

      

      {/* Módulo Root (admin) */}
      <Route
        path="/panelAdministrador/root"
        element={
          <AdminRoute>
            <Root />
          </AdminRoute>
        }
      />

      {/* ✅ Nueva ruta para crear administrador */}
      <Route
        path="/panelAdministrador/root/create-admin"
        element={
          <AdminRoute>
            <CreateAdmin />
          </AdminRoute>
        }
      />

      {/* ✅ Cambio de contraseña obligatorio */}
      <Route
        path="/ChangePassword"
        element={
          <PrivateRoute>
            <ChangePassword />
          </PrivateRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}