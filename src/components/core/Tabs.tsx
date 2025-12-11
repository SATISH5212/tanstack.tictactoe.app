import { useNavigate, useParams, useLocation } from "@tanstack/react-router";
import SearchFilter from "./SearchFilter";

const Tabs = ({ searchString, setSearchString, title }: any) => {
  const navigate = useNavigate();
  const { user_id } = useParams({ strict: false });
  const { pathname } = useLocation();
  const isPondsActive = pathname.includes("ponds");
  const isGatewaysActive = pathname.includes("gateways");
  const isDevicesActive =
    pathname.includes("devices") ||
    pathname.includes("StarterBox") ||
    pathname.includes("apfc");

  const sortField = isPondsActive
    ? "title"
    : isDevicesActive
      ? "title"
      : isGatewaysActive
        ? "title"
        : "title";

  return (
    <div className="w-full flex">
      <div className="flex items-center bg-gray-100 pl-4 pr-3 py-1 w-full relative gap-5">
        <div className="flex items-center gap-3 h-full w-full md:w-1/3">
          <div
            onClick={() => navigate({ to: `/users/${user_id}/ponds` })}
            className={`font-medium cursor-pointer h-full flex items-center text-xs 3xl:text-sm relative px-2 ${
              isPondsActive ? "text-primary" : ""
            }`}
          >
            Ponds
            {isPondsActive && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary"></span>
            )}
          </div>
          <div
            onClick={() => navigate({ to: `/users/${user_id}/devices` })}
            className={`font-medium cursor-pointer flex items-center h-full relative px-2 text-xs 3xl:text-sm ${
              isDevicesActive ? "text-primary" : ""
            }`}
          >
            Devices
            {isDevicesActive && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary"></span>
            )}
          </div>
          <div
            onClick={() => navigate({ to: `/users/${user_id}/gateways` })}
            className={`font-medium cursor-pointer flex items-center h-full relative px-2 text-xs 3xl:text-sm ${
              isGatewaysActive ? "text-primary" : ""
            }`}
          >
            Gateways
            {isGatewaysActive && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary"></span>
            )}
          </div>
        </div>
        <div className="h-8 w-full flex items-center justify-end gap-2">
          <SearchFilter
            searchString={searchString}
            setSearchString={setSearchString}
            title={title}
            className="w-2/3 h-full shadow-none border border-slate-200 rounded-md overflow-hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default Tabs;
