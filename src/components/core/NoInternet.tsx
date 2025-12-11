export function NoInternet() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center bg-gray-100">
      <div className="text-8xl mb-5">
        📡
      </div>
      <h1 className="text-2xl font-bold mb-2.5 text-gray-800">
        No Internet Connection
      </h1>
      <p className="text-base text-gray-600 mb-5 max-w-md">
        Please check your network connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 text-base bg-blue-600 text-white border-none rounded-md cursor-pointer transition-colors hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );
}