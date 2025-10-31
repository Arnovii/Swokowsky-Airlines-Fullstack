import { useState, useEffect } from 'react';



interface WalletBalanceProps {

totalAmount: number;

}



const WalletBalance: React.FC<WalletBalanceProps> = ({ totalAmount }) => {

const [isExpanded, setIsExpanded] = useState(false);

const [balance, setBalance] = useState<number>(2500000);

const [loading, setLoading] = useState(false);

const [error, setError] = useState<string | null>(null);



const fetchBalance = async () => {

try {

setLoading(true);

setError(null);

await new Promise(resolve => setTimeout(resolve, 500));

const simulatedBalance = 2500000;

setBalance(simulatedBalance);

} catch (err: any) {

console.error('Error al obtener saldo:', err);

setError('No se pudo cargar el saldo');

setBalance(0);

} finally {

setLoading(false);

}

};



const handleRecharge = () => {

alert('Funcionalidad de recarga en desarrollo');

};



const hasEnoughBalance = balance >= totalAmount;

const remainingBalance = balance - totalAmount;



if (loading) {

return (

<div className="relative overflow-hidden bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-3xl p-8 shadow-2xl">

<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

<div className="relative flex items-center justify-center gap-4">

<div className="w-10 h-10 border-4 border-[#39A5D8]/30 border-t-[#39A5D8] rounded-full animate-spin"></div>

<span className="text-xl font-semibold text-white font-sans">Cargando saldo...</span>

</div>

</div>

);

}



if (error) {

return (

<div className="relative overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-950 rounded-3xl p-8 shadow-2xl">

<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

<div className="relative flex items-center justify-between">

<div className="flex items-center gap-4">

<div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg">

<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />

</svg>

</div>

<div>

<p className="text-white/90 text-sm font-medium uppercase tracking-wide font-sans">Error</p>

<p className="text-xl font-bold text-white font-sans">{error}</p>

</div>

</div>

<button

onClick={fetchBalance}

className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 font-sans"

>

Reintentar

</button>

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

<div className="flex items-center justify-between mb-6">

<div className="flex items-center gap-4">

<div className="w-16 h-16 bg-gradient-to-br from-[#39A5D8] via-[#1180B8] to-[#123361] rounded-2xl flex items-center justify-center shadow-lg">

<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />

</svg>

</div>

<div>

<p className="text-white/90 text-sm font-medium uppercase tracking-wider mb-1 font-sans">Saldo Disponible</p>

<p className="text-4xl font-bold text-white tracking-tight font-sans">${balance.toLocaleString('es-CO')}</p>

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



{isExpanded && (

<div className="space-y-4 pt-6 border-t border-[#39A5D8]/20 animate-fade-in">

<div className="bg-gradient-to-br from-[#39A5D8]/10 via-[#1180B8]/10 to-[#123361]/10 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-[#39A5D8]/20">

<div className="flex justify-between items-center">

<span className="text-white/90 font-medium font-sans">Total a pagar:</span>

<span className="font-bold text-2xl text-white font-sans">${totalAmount.toLocaleString('es-CO')}</span>

</div>


<div className="flex justify-between items-center">

<span className="text-white/90 font-medium font-sans">Saldo restante:</span>

<span className={`font-bold text-2xl font-sans ${hasEnoughBalance ? 'text-[#39A5D8]' : 'text-red-400'}`}>

${remainingBalance.toLocaleString('es-CO')}

</span>

</div>

</div>



{!hasEnoughBalance && (

<div className="bg-red-500/10 border-2 border-red-400/30 rounded-2xl p-4 backdrop-blur-sm">

<div className="flex items-start gap-3">

<div className="w-6 h-6 bg-red-400/20 rounded-full flex items-center justify-center flex-shrink-0">

<svg className="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">

<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

</svg>

</div>

<div>

<p className="text-sm font-semibold text-red-300 mb-1 font-sans">Saldo insuficiente</p>

<p className="text-sm text-red-200 font-sans">

Necesitas ${Math.abs(remainingBalance).toLocaleString('es-CO')} adicionales para completar tu compra.

</p>

</div>

</div>

</div>

)}



{hasEnoughBalance && (

<div className="bg-[#39A5D8]/10 border-2 border-[#39A5D8]/30 rounded-2xl p-4 backdrop-blur-sm">

<div className="flex items-center gap-3">

<div className="w-6 h-6 bg-[#39A5D8]/20 rounded-full flex items-center justify-center">

<svg className="w-4 h-4 text-[#39A5D8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />

</svg>

</div>

<p className="text-sm font-semibold text-[#39A5D8] font-sans">

¡Tienes saldo suficiente para completar la compra!

</p>

</div>

</div>

)}



<button

onClick={handleRecharge}

className="w-full mt-4 py-4 bg-gradient-to-br from-[#39A5D8] via-[#1180B8] to-[#123361] hover:from-[#39A5D8]/90 hover:via-[#1180B8]/90 hover:to-[#123361]/90 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl hover:shadow-[#39A5D8]/30 flex items-center justify-center gap-3 group font-sans"

>

<svg className="w-6 h-6 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">

<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />

</svg>

RECARGAR MONEDERO

</button>

</div>

)}

</div>

</div>

);

};



export default WalletBalance;