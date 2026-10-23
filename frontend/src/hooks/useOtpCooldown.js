import { useEffect, useState } from "react";

export const getOtpRetryAfterSeconds = (response, data) => {
    const headerSeconds = Number(response.headers.get("Retry-After"));
    const bodySeconds = Number(data.retryAfterSeconds);
    const messageSeconds = Number(data.message?.match(/wait (\d+) seconds?/i)?.[1]);
    const seconds = headerSeconds || bodySeconds || messageSeconds;

    return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
};

const useOtpCooldown = () => {
    const [secondsRemaining, setSecondsRemaining] = useState(0);

    useEffect(() => {
        if (secondsRemaining <= 0) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            setSecondsRemaining((remaining) => Math.max(remaining - 1, 0));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [secondsRemaining]);

    return [secondsRemaining, setSecondsRemaining];
};

export default useOtpCooldown;
