import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWalletBalance } from '../hooks/useWalletBalance';

interface WalletBalanceProps {
  totalAmount: number;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ totalAmount }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Usa el hook para obtener el saldo real
  const token = user?.token || localStorage.getItem('token');
  const { saldo, loading } = useWalletBalance(token);

  const balance = saldo ?? 0;
  const hasEnoughBalance = balance >= totalAmount;
  const remainingBalance = balance - totalAmount;
  const usagePercentage = balance > 0 ? Math.min((totalAmount / balance) * 100, 100) : 0;

  const handleRecharge = () => {
    navigate('/profile/wallet');
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="relative flex items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-[#39A5D8]/30 border-t-[#39A5D8] rounded-full animate-spin"></div>
          <span className="text-xl font-semibold text-white">Cargando saldo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-[#39A5D8]/20">
      {/* Efectos decorativos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#39A5D8]/5 to-transparent"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#39A5D8]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#1180B8]/10 rounded-full blur-3xl"></div>

      <div className="relative">
        {/* Header con saldo */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#39A5D8] via-[#1180B8] to-[#123361] rounded-2xl flex items-center justify-center shadow-lg shadow-[#39A5D8]/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium uppercase tracking-wider mb-1">
                Saldo Disponible
              </p>
              <p className="text-4xl font-bold text-white tracking-tight">
                ${balance.toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-12 h-12 bg-gradient-to-br from-[#39A5D8]/20 via-[#1180B8]/20 to-[#123361]/20 rounded-xl flex items-center justify-center hover:from-[#39A5D8]/30 hover:via-[#1180B8]/30 hover:to-[#123361]/30 backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-[#39A5D8]/20"
          >
            <svg
              className={`w-6 h-6 text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Barra de progreso visual */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/70">Uso del saldo para esta compra</span>
            <span className="text-sm font-bold text-white">{usagePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                hasEnoughBalance
                  ? 'bg-gradient-to-r from-[#39A5D8] via-[#1180B8] to-[#123361]'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Sección expandible */}
        {isExpanded && (
          <div className="space-y-4 pt-6 border-t border-[#39A5D8]/20 animate-fade-in">
            {/* Desglose de montos */}
            <div className="bg-gradient-to-br from-[#39A5D8]/10 via-[#1180B8]/10 to-[#123361]/10 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-[#39A5D8]/20">
              <div className="flex justify-between items-center">
                <span className="text-white/90 font-medium">Total a pagar:</span>
                <span className="font-bold text-2xl text-white">
                  ${totalAmount.toLocaleString('es-CO')}
                </span>
              </div>

              <div className="h-px bg-[#39A5D8]/20"></div>

              <div className="flex justify-between items-center">
                <span className="text-white/90 font-medium">Saldo actual:</span>
                <span className="font-bold text-2xl text-white">
                  ${balance.toLocaleString('es-CO')}
                </span>
              </div>

              <div className="h-px bg-[#39A5D8]/20"></div>

              <div className="flex justify-between items-center">
                <span className="text-white/90 font-medium">Saldo restante:</span>
                <span className={`font-bold text-2xl ${hasEnoughBalance ? 'text-[#39A5D8]' : 'text-red-400'}`}>
                  ${Math.abs(remainingBalance).toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            {/* Alerta de saldo insuficiente */}
            {!hasEnoughBalance && (
              <div className="bg-red-500/10 border-2 border-red-400/30 rounded-2xl p-4 backdrop-blur-sm animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-300 mb-1">
                      ⚠️ Saldo insuficiente
                    </p>
                    <p className="text-sm text-red-200">
                      Necesitas <span className="font-bold">${Math.abs(remainingBalance).toLocaleString('es-CO')}</span> adicionales para completar tu compra.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmación de saldo suficiente */}
            {hasEnoughBalance && (
              <div className="bg-[#39A5D8]/10 border-2 border-[#39A5D8]/30 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#39A5D8]/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#39A5D8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#39A5D8]">
                    ✅ ¡Tienes saldo suficiente para completar la compra!
                  </p>
                </div>
              </div>
            )}

            {/* Botón de recarga */}
            <button
              onClick={handleRecharge}
              className="w-full mt-4 py-4 bg-gradient-to-br from-[#39A5D8] via-[#1180B8] to-[#123361] hover:from-[#39A5D8]/90 hover:via-[#1180B8]/90 hover:to-[#123361]/90 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl hover:shadow-[#39A5D8]/30 flex items-center justify-center gap-3 group"
            >
              <svg className="w-6 h-6 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              RECARGAR BILLETERA
            </button>
          </div>
        )}
      </div>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WalletBalance;