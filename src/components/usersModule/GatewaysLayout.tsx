import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "@tanstack/react-router"; // Add this import
import GetAllUserLocations from "./GetAllUserLocations";
import GetAllUserGateways from "./GetAllUserGateWays";

const LocationsAndGatewaysLayout = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const { location_id } = useParams({ strict: false }); 

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleLocationsUpdate = useCallback((fetchedLocations: any[]) => {
    setLocations((prevLocations) => {
      if (JSON.stringify(prevLocations) !== JSON.stringify(fetchedLocations)) {
        return fetchedLocations;
      }
      return prevLocations;
    });
  }, []);

  return (
    <div className="flex bg-neutral-100">
      <div className="w-[20%] ">
        <GetAllUserLocations
          onLocationsUpdate={handleLocationsUpdate}
          userId={userId}
        />
      </div>

      <div className="w-[80%]">
        {location_id ? (
          <GetAllUserGateways userId={userId} locations={locations} />
        ) : (
          <div className="flex justify-center items-center h-[calc(100vh-50px)] text-gray-500 text-sm">
          
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationsAndGatewaysLayout;
