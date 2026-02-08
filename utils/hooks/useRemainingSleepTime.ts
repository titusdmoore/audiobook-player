import { useEffect, useState } from "react";

export default function useRemainingSleepTime(endTime: number | null): number {
	endTime = endTime || 0;
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		if (!endTime) return;
		const interval = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(interval);
	}, [endTime]);

	return Math.max(0, Math.round((endTime - now) / 1000));
}
