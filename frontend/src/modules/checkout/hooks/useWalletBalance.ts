import { useState, useEffect } from 'react';
import api from '../../../api/axios';

export function useWalletBalance() {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.get('/monedero')
      .then(res => {
        if (isMounted) {
          setSaldo(res.data.saldoActual ?? 0);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Error al obtener saldo:', err?.response?.data || err.message);
          setSaldo(0);
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  return { saldo, loading };
}