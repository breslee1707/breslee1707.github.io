import { useEffect, useState } from "react";

const format = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

/**
 * Current time in Ho Chi Minh City. Rendered as a placeholder on the server
 * (so prerendered HTML never carries a stale time) and filled in on mount.
 */
export function LocalTime({ className = "" }: { className?: string }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(format());
    const id = window.setInterval(() => setTime(format()), 20_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={className}>
      <span className="local-dot" aria-hidden />
      Ho Chi Minh City · <time className="tabular-nums">{time || "··:··"}</time> local
      time (GMT+7)
    </span>
  );
}
