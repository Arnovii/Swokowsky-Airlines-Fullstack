import { useEffect, useState } from "react";

export function useCountdown(targetDate: string) {
    const getTimeLeft = () => {
        const now = new Date().getTime();
        const target = new Date(targetDate).getTime();
        const diff = Math.max(target - now, 0);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return { hours, minutes, seconds, expired: diff === 0 };
    };
    const [timeLeft, setTimeLeft] = useState(getTimeLeft());
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);
    return timeLeft;
}
