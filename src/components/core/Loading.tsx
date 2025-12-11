import { LoadingComponentProps } from "src/lib/interfaces";
import LoadingIcon from "app/assets/loading-icon.svg";

const LoadingComponent: React.FC<LoadingComponentProps> = ({
  loading,
  message,
  className,
}) => {
  if (!loading) return null;
 return (
    <div
      role="alert"
      aria-live="assertive"
      className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50"
    >
    <p>{message || "Loading..."}</p>
    </div>
  );
};

export default LoadingComponent;
