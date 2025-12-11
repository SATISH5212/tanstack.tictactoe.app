
export default function LocationListSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-1  p-2 rounded-lg border border-gray-200 animate-pulse"
        >
          <div className="flex flex-col items-start  w-full">
            <div className="flex items-center gap-3 w-full">
              <div className="h-6 w-6 rounded-full bg-gray-300" />

              <div className="h-4 w-32 bg-gray-300 rounded" />
            </div>

            <div className="h-3 w-20 bg-gray-200 rounded ml-9" />
          </div>

          <div className="h-5 w-5 bg-gray-300 rounded-md" />
        </div>
      ))}
    </>
  );
}
