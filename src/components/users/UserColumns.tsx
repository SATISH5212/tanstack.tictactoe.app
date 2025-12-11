import { useLocation, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "src/components/ui/hover-card";
import { capitalize } from "src/lib/helpers/capitalize";
import { DeleteDeviceIcon } from "../svg/DeletePond";
import { EditDeviceIcon } from "../svg/EditDevice";
import { LocationSvg } from "../svg/location";
import LocationIcon from "../svg/map/LocationIcon";
export default function UserColumns({
  onDeleteUser,
}: {
  onDeleteUser: (deleteContactObj: any) => void;
}) {
  const router = useRouter();
  const location = useLocation();
  const handleRowClick = (userId: number, locationId?: number) => {
    const searchParams = new URLSearchParams(location.search);
    router.navigate({
      to: `/users/${userId}/ponds`,
      search: {
        locationId: locationId || undefined,
        search_string: searchParams.get("search_string") || undefined,
        starter_id: searchParams.get("starter_id") || undefined,
      },
    });
  };
  const handleLocationClick = (location: any, userId: number) => {
    const locationId = location?.id;
    handleRowClick(userId, locationId);
  };

  return [
    {
      accessorFn: (row: any) => {
        const firstName = row.full_name ? capitalize(row.full_name) : "-";
        const lastName = row.lastname ? capitalize(row.lastname) : "";
        const fullNameRaw = `${firstName} ${lastName}`;
        const truncatedName =
          fullNameRaw.length > 15
            ? fullNameRaw.slice(0, 15) + "..."
            : fullNameRaw;
        const locations = row.locations || [];
        const firstLocation = locations[0]?.title
          ? capitalize(locations[0]?.title)
          : "--";
        const truncatedLocation =
          firstLocation.length > 10
            ? firstLocation.slice(0, 10) + "..."
            : firstLocation;
        const remainingCount = locations.length - 1;
        return {
          id: row.id,
          completename: fullNameRaw,
          fullname: truncatedName,
          avatar: row.profile_pic || null,
          locations: locations,
          firstLocation: truncatedLocation,
          completeLocation: firstLocation,
          remainingCount: remainingCount,
        };
      },
      id: "full_name",
      header: () => (
        <span className="cursor-default text-xs 3xl:text-sm whitespace-nowrap text-left flex-start">
          User Name
        </span>
      ),
      cell: (info: any) => {
        const {
          id,
          fullname,
          completename,
          avatar,
          locations,
          firstLocation,
          completeLocation,
          remainingCount,
        } = info.getValue() || {
          id: null,
          fullname: "--",
          completename: "--",
          avatar: null,
          locations: [],
          firstLocation: "--",
          completeLocation: "--",
          remainingCount: 0,
        };

        const [isHoverOpen, setIsHoverOpen] = useState(false);
        const timeoutRef = useRef<NodeJS.Timeout | null>(null);
        const [hoverSide, setHoverSide] = useState<"top" | "bottom" | "right">(
          "right"
        );
        const triggerRef = useRef<HTMLSpanElement | null>(null);

        const calculateHoverPosition = useCallback(() => {
          if (!triggerRef.current) return;

          const rect = triggerRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const hoverCardHeight = 208;
          const spaceBelow = viewportHeight - rect.bottom;
          const spaceAbove = rect.top;

          if (spaceBelow >= hoverCardHeight + 20) {
            setHoverSide("bottom");
          } else if (spaceAbove >= hoverCardHeight + 20) {
            setHoverSide("top");
          } else {
            setHoverSide("right");
          }
        }, []);

        const handleMouseEnter = () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setIsHoverOpen(true);
        };

        const handleMouseLeave = () => {
          timeoutRef.current = setTimeout(() => {
            setIsHoverOpen(false);
          }, 200);
        };
        const handleWheel = (e: React.WheelEvent) => {
          if (isHoverOpen) {
            e.stopPropagation();
          }
        };
        const handleCellClick = () => {
          handleRowClick(id);
        };

        useEffect(() => {
          const handleResize = () => {
            if (isHoverOpen) {
              calculateHoverPosition();
            }
          };

          window.addEventListener("resize", handleResize);
          return () => window.removeEventListener("resize", handleResize);
        }, [isHoverOpen, calculateHoverPosition]);

        return (
          <div
            className="relative flex items-start gap-2 p-1 cursor-pointer"
            onClick={handleCellClick}
          >
            <div className="flex flex-col items-start">
              <span
                className="text-xs 3xl:text-sm truncate"
                title={completename}
              >
                {fullname}
              </span>
              <div className="relative">
                <HoverCard open={isHoverOpen} onOpenChange={setIsHoverOpen}>
                  <HoverCardTrigger asChild>
                    <span
                      className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      ref={triggerRef}
                      title={
                        locations.length === 1 ? completeLocation : undefined
                      }
                    >
                      <LocationIcon className="size-3" />
                      <span>{firstLocation}</span>
                      {remainingCount > 0 && (
                        <span className="text-xs bg-blue-200 rounded-full text-blue-500 py-1 px-2">
                          +{remainingCount}
                        </span>
                      )}
                    </span>
                  </HoverCardTrigger>

                  {remainingCount > 0 && (
                    <HoverCardContent
                      align="start"
                      side={hoverSide}
                      className="z-[9999] w-52 max-h-52 p-3 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg"
                      sideOffset={5}
                      alignOffset={hoverSide === "right" ? -10 : 0}
                      onWheel={handleWheel}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      avoidCollisions={true}
                      collisionPadding={10}
                    >
                      <div className="space-y-2 text-xs">
                        {locations.map((location: any) => (
                          <div
                            key={location.id}
                            className="flex items-start gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLocationClick(location, id);
                            }}
                          >
                            <LocationSvg />
                            <div className="text-left">
                              {capitalize(location.title)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </HoverCardContent>
                  )}
                </HoverCard>
              </div>
            </div>
          </div>
        );
      },
      width: "25%",
    },

    {
      id: "actions",
      header: () => (
        <span className="text-xs 3xl:text-sm whitespace-nowrap cursor-default">
          Actions
        </span>
      ),
      cell: (info: any) => {
        const user = info.row.original;
        return (
          <div className="flex items-center gap-2 p-2">
            <button
              className="text-gray-500 hover:text-orange-500"
              onClick={() =>
                router.navigate({ to: `/users/${user.id}/update` })
              }
              title="Edit user"
            >
              <EditDeviceIcon className="size-3.5" />
            </button>
            <button
              className="text-gray-500 hover:text-red-500"
              onClick={() => onDeleteUser(info.row.original)}
              title="Delete user"
            >
              <DeleteDeviceIcon className="size-3.5" />
            </button>
          </div>
        );
      },
      width: "10%",
      enableSorting: false,
    },
  ];
}
