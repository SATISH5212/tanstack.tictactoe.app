import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryTime, setRetryTime] = useState(0); 
  const [showOnlineMsg, setShowOnlineMsg] = useState(false);
  const [showOfflineMsg, setShowOfflineMsg] = useState(false);
  const [startFadeOut, setStartFadeOut] = useState(false);

  const formatTime = (secs: number) => {
    if (secs < 60) return `${secs}s`;

    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (secs < 3600) return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

    const h = Math.floor(secs / 3600);
    const mm = Math.floor((secs % 3600) / 60);
    return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setRetryTime(0); 
      setShowOfflineMsg(false);
      setShowOnlineMsg(true);
      setStartFadeOut(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setRetryTime(1); 
      setShowOfflineMsg(true);
      setShowOnlineMsg(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      const interval = setInterval(() => {
        setRetryTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  useEffect(() => {
    if (showOnlineMsg) {
      const fadeTimer = setTimeout(() => setStartFadeOut(true), 3000);
      const removeTimer = setTimeout(() => setShowOnlineMsg(false), 4500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [showOnlineMsg]);

  return (
    <>
      {showOfflineMsg && !isOnline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] md:w-[500px]
          bg-red-50 border border-red-300 rounded-xl shadow-lg p-4 flex items-center justify-center
          gap-3 animate-fadeIn"
        >
          <WifiOff className="text-red-600 w-5 h-5" />
          <p className="text-sm font-medium text-red-600">
            No Internet Connection. Reconnecting... ({formatTime(retryTime)})
          </p>
        </div>
      )}

      {showOnlineMsg && isOnline && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-fit
          bg-green-50 border border-green-300 rounded-xl shadow-lg p-4 flex items-center justify-center 
          gap-3 ${startFadeOut ? "animate-fadeOut" : "animate-fadeIn"}`}
        >
          <Wifi className="text-green-600 w-5 h-5" />
          <p className="text-green-600 text-sm font-medium">
            Back to online
          </p>
        </div>
      )}
    </>
  );
};
