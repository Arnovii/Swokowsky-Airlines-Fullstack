// src/modules/checkout/components/WalletBalance.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';

interface WalletBalanceProps {
  totalAmount: number;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ totalAmount }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el saldo del usuario desde la API
  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Ajusta este endpoint según tu API real
      // Ejemplo: const response = await api.get('/user/balance');
      // Por ahora usamos simulación
      
      // SIMULACIÓN - Reemplazar con llamada real
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      const simulatedBalance = 2500000; // Saldo simulado
      setBalance(simulatedBalance);
      
      // CUANDO TENGAS LA API REAL, USA ESTO:
      /*
      const response = await api.get(`/users/${user?.id_usuario}/balance`);
      setBalance(response.data.balance || 0);
      */
      
    } catch (err: any) {
      console.error('Error al obtener saldo:', err);
      setError('No se pudo cargar el saldo');
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  // Cargar saldo al montar el componente
  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user?.id_usuario]);

  const hasEnoughBalance = balance >= totalAmount;
  const remainingBalance = balance - totalAmount;

  // Vista de carga
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F6899] to-[#39A5D8] rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="text-lg font-semibold">Cargando saldo...</span>
        </div>
      </div>
    );
  }

  // Vista de error
  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Error al cargar saldo</p>
              <p className="text-lg font-bold">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchBalance}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0F6899] to-[#39A5D8] rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Saldo Disponible</p>
            <p className="text-2xl font-bold">${balance.toLocaleString('es-CO')}</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-300"
        >
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-4 border-t border-white/20 animate-fade-in">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Total a pagar:</span>
            <span className="font-semibold text-lg">${totalAmount.toLocaleString('es-CO')}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/80">Saldo restante:</span>
            <span className={`font-bold text-lg ${hasEnoughBalance ? 'text-green-300' : 'text-red-300'}`}>
              ${remainingBalance.toLocaleString('es-CO')}
            </span>
          </div>

          {!hasEnoughBalance && (
            <div className="bg-red-500/20 border border-red-300/30 rounded-lg p-3 mt-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-red-100">
                  Saldo insuficiente. Necesitas ${Math.abs(remainingBalance).toLocaleString('es-CO')} adicionales.
                </p>
              </div>
            </div>
          )}

          {hasEnoughBalance && (
            <div className="bg-green-500/20 border border-green-300/30 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-100 font-medium">
                  ¡Tienes saldo suficiente para completar la compra!
                </p>
              </div>
            </div>
          )}

          {/* Botón para recargar saldo */}
          <button
            onClick={fetchBalance}
            className="w-full mt-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar saldo
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;