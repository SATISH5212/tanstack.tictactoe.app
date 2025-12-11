import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/fetch-error")({
  component: FetchErrorPage,
});

export default function FetchErrorPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const status = searchParams.get("status");
  const [error, setError] = useState<string>("");
  useEffect(() => {
    switch (status) {
      case "400":
        setError("Bad Request");
        break;
      case "401":
        setError("Unauthorized");
        break;
      case "402":
        setError("The user has exceeded usage limits");
        break;
      case "403":
        setError("You don’t have permission");
        break;
      case "404":
        setError("Not Found");
        break;
      default:
        setError("Unexpected Error");
    }
  }, [status]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-20 h-20 text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
            />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-3">{status}</h2>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">{error}</h1>

        <div className=" flex flex-col text-gray-500 space-y-1 mb-6 w-full">
          <span>
            We couldn’t complete your request due to an unexpected error.
          </span>
          <span>Please try again or go back to the dashboard.</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition"
          >
            Retry
          </button>

          <button
            onClick={() => window.location.replace("/dashboard")}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
