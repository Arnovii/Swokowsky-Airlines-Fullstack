import React from "react";
import { AdminPanel } from "../components/adminpanel";

export const PanelAdministrador: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminPanel />
    </div>
  );
};


export default PanelAdministrador;