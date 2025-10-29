import React from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AddToCartButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  onClick,
  disabled = false,
  children = 'Agregar al carrito de compras',
  className = '',
}) => {
  const { user } = useAuth();
  const isAdmin = user?.tipo_usuario === "admin";

  const handleClick = () => {
    if (isAdmin) {
      toast.error(
        <div className="text-lg">
          <strong className="block text-xl mb-1">Acción no permitida</strong>
          <div className="mt-1">
            Los usuarios tipo <span>administrador</span> no pueden comprar ni reservar vuelos.
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        }
      );
      return;
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-[#0F6899] to-[#39A5D8] text-white rounded-xl hover:from-[#39A5D8] hover:to-[#0F6899] transition-all duration-300 font-bold font-sans shadow-lg hover:shadow-2xl hover:scale-105 transform border border-[#39A5D8]/30 ${className}`}
      type="button"
    >
      {children}
    </button>
  );
};

export default AddToCartButton;