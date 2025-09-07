import { Routes, Route } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import Home from "../modules/home/pages/Home"
import Perfil from "../modules/user_profile/pages/Perfil"
import Login from "../modules/auth/pages/Login"
import Register from "../modules/auth/pages/Register"
import ForgotPassword from "../modules/auth/pages/ForgotPassword"
import NotFound from "../modules/error/pages/NotFound"

export default function AppRoutes() {
  return (
    <Routes>
        
      <Route element={<MainLayout />}> {/* Aquí estamos creando la navegación teniendo de base al MainLayout y definiendo las páginas hijas*/}
        <Route path="/" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound/> }/>
    </Routes>
  )
}
