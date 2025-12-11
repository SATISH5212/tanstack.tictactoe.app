interface SwitchToggleProps {
  status: "on" | "off" | null;
  onToggle: (status: "on" | "off" | null) => void;
}

export default function SwitchToggle({ status, onToggle }: SwitchToggleProps) {
  const handleOnClick = () => {
    onToggle(status === "on" ? null : "on"); 
  };
  const handleOffClick = () => {
    onToggle(status === "off" ? null : "off"); 
  };
  return (
    <div className="w-24 h-8 flex border border-gray-400 overflow-hidden cursor-pointer text-xs font-semibold shadow-md">
            <div
        className={`w-1/2 flex items-center justify-center transition-colors duration-300 ${
          status === "off" ? "bg-red-500 text-white" : "bg-white text-black"
        }`}
        onClick={handleOffClick}
      >
        OFF
      </div>
      <div
        className={`w-1/2 flex items-center justify-center transition-colors duration-300 ${
          status === "on" ? "bg-green-500 text-white" : "bg-white text-black"
        }`}
        onClick={handleOnClick}
      >
        ON
      </div>
    </div>
  );
}
