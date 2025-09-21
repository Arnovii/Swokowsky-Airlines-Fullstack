export function useMessaging() {
  // Aquí irá la lógica futura para el sistema de mensajería con administradores
  const sendMessage = (message: string) => {
    console.log(`Mensaje enviado: "${message}" (lógica a implementar)`);
    alert(`Mensaje enviado al administrador: "${message}"`);
  };

  return { sendMessage };
}

