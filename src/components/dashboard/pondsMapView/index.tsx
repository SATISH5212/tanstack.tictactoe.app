import { useMapBox } from "@/hooks/maps/useMapBox";
import { useMapboxSearch } from "@/hooks/maps/useMapSearchFilter";
import { useMqttPublishSubscribe } from "@/hooks/useMqttPublishSubscribe";
import {
  adjustPondZoom,
  adjustPondZoomWithResize,
  resetMapToInitialZoom,
} from "@/lib/helpers/map/adjustMapPondsZoom";
import {
  updateMotorsModeAndState,
  updateMotorsModeAndState2,
} from "@/lib/helpers/map/mqttHelpers/updateMotorsModeAndState";
import { generateRandomColor } from "@/lib/helpers/map/randomizeColors";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { Motor, Pond, PondCoordinate } from "@/lib/interfaces/maps/ponds";
import MapLoader from "@/components/core/MapLoader";
import {
  AddMotorToPondAPI,
  deleteMotorAPI,
  getAllPondsAPI,
  singlePondAPI,
} from "@/lib/services/ponds";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import * as turf from "@turf/turf";
import { MoveLeft } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import { useLocationContext } from "../../context/LocationContext";
import { useMqttConnectionContext } from "../../context/MqttConnectionContext";
import { LayoutIcon } from "../../svg/LayoutIcon";
import MotorIcon from "../../svg/MotorIcon";
import { Button } from "../../ui/button";
import AddMotorDialog from "../AddMotorDialog";
import AddPondSideBar from "../addPond/AddPondSideBar";
import MapIconsPage from "../addPond/MapIconsPage";
import MapSearchBox from "../MapSearchBox";
import MotorMarkerTooltip from "../MotorMarkerTooltip";
import PondMotorsCard from "../pondsTableView/singlePondPage/PondMotorsCard";
import StatsList from "../StatsList";
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_MAP_API_KEY as string;

const pondsMapView = () => {
  const {
    locations,
    selectedLocation,
    selectedLocationId,
    setSelectedLocationId,
    setSelectedLocation,
    isLocationsLoading,
  } = useLocationContext();

  const { client, isConnected } = useMqttConnectionContext();
  const {
    isSubscribed,
    latestMotorControlAck,
    latestLiveData,
    latestModeChangeAck,
    subscribeToGatewayTopics,
    unsubscribeFromGatewayTopics,
    handleMotorContorlPublish,
    handleMotorModePublish,
  } = useMqttPublishSubscribe({
    client,
    isConnected,
  });

  useEffect(() => {
    if (isConnected && client) {
      subscribeToGatewayTopics();
    }
    return () => {
      if (isSubscribed) {
        unsubscribeFromGatewayTopics();
      }
    };
  }, [isConnected, client]);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const motorMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const markerRootsRef = useRef<Map<number, any>>(new Map());
  const pondsLayersAddedRef = useRef(false);
  const isMotorSheet = useRef(false);
  const tempMotorMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const selectedPondForMotorRef = useRef<Pond | null>(null);
  const originalPondRef = useRef<Pond | null>(null);
  const addPondRef = useRef(false);
  const motorDataMapRef = useRef<Map<number, Motor>>(new Map());
  const [selectedPondIndex, setSelectedPondIndex] = useState<number | null>(
    null
  );
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [pendingMotorLocation, setPendingMotorLocation] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [isAddingMotor, setIsAddingMotor] = useState(false);
  const [isPondAdding, setIsPondAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<Record<
    string,
    string
  > | null>(null);
  const [pondName, setPondName] = useState("");
  const [motorName, setMotorName] = useState("");
  const [motorHp, setMotorHp] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [motorErrorMessage, setMotorErrorMessage] = useState<Record<
    string,
    string
  > | null>(null);
  const [showPondMotorsCard, setShowPondMotorsCard] = useState(false);

  const [dateRange, setDateRange] = useState<{
    from_date: string;
    to_date: string;
  } | null>(null);

  const isPondsTablePage = false;
  const queryClient = useQueryClient();
  const { search } = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const addParam = searchParams.get("add");
  const editParam = searchParams.get("edit");
  const getPondIdFromUrl = useCallback((): number | null => {
    if (typeof window === "undefined") return null;
    const searchParams = new URLSearchParams(window.location.search);
    const pondId = searchParams.get("pond");
    return pondId ? parseInt(pondId, 10) : null;
  }, []);
  const getUserIdFromUrl = useCallback((): number | null => {
    if (typeof window === "undefined") return null;
    const userId = searchParams.get("user_id");
    return userId ? parseInt(userId, 10) : null;
  }, [searchParams]);
  const urlPondId = getPondIdFromUrl();
  const urlUserId = getUserIdFromUrl();
  const {
    data: allPondsData,
    isLoading: isPondsLoading,
    isRefetching: isPondsRefetching,
  } = useInfiniteQuery({
    queryKey: ["all-ponds", selectedLocationId],
    queryFn: async () => {
      const locationId =
        selectedLocationId || (locations.length > 0 ? locations[0]?.id : null);
      if (!locationId) {
        return { records: [], pagination: null };
      }

      const queryParams: any = {
        get_all: true,
        location_id: locationId,
        ...(urlUserId && isAdmin() && { user_id: urlUserId }),
      };
      const response = await getAllPondsAPI(queryParams);
      return response.data?.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (!pagination) return undefined;
      const { current_page, total_pages } = pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: locations?.length > 0,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  });
  const { mapPonds } = useMemo(() => {
    const allPonds = allPondsData?.pages?.flatMap((page) => page?.records || []) || [];
    const updatedMotors = updateMotorsModeAndState(
      allPonds,
      latestMotorControlAck,
      latestModeChangeAck,
      latestLiveData
    );
    return {
      mapPonds: updatedMotors,
    };
  }, [
    allPondsData,
    latestMotorControlAck,
    latestModeChangeAck,
    latestLiveData,
    isPondsRefetching,
  ]);


  const selectedPond = selectedPondIndex !== null ? mapPonds[selectedPondIndex] : null;

  const { data: singlePondData, isLoading: isSinglePondLoading } = useQuery({
    queryKey: ["single-pond", urlPondId],
    queryFn: async () => {
      const response = await singlePondAPI(urlPondId as number);
      return response.data.data;
    },
    enabled: !!urlPondId,
    refetchOnWindowFocus: false,
  });

  const motors = useMemo(() => {
    const allMotors = singlePondData?.motors || [];
    const updatedMotors = updateMotorsModeAndState2(
      allMotors,
      latestMotorControlAck,
      latestModeChangeAck,
      latestLiveData
    );
    return {
      motors: updatedMotors,
    };
  }, [singlePondData, latestMotorControlAck, latestModeChangeAck, latestLiveData,]);

  const { mutate: addMotor, isPending: isAddingMotorPending } = useMutation({
    mutationFn: AddMotorToPondAPI,
    onSuccess: async () => {
      toast.success("Motor added successfully!");
      setIsDialogOpen(false);
      setPendingMotorLocation(null);
      setIsAddingMotor(false);
      selectedPondForMotorRef.current = null;
      setMotorName("");
      setMotorHp("");
      setMotorErrorMessage(null);
      tempMotorMarkerRef.current?.remove();
      tempMotorMarkerRef.current = null;

      await queryClient.invalidateQueries({ queryKey: ["paginated-ponds"] });
      await queryClient.invalidateQueries({ queryKey: ["all-ponds"] });
      await queryClient.invalidateQueries({ queryKey: ["single-pond"] });
      setTimeout(() => {
        if (isPondEditing && selectedPondIndex !== null) {
          const updatedPond = mapPonds.find(
            (p) => p.id === mapPonds[selectedPondIndex]?.id);
          if (updatedPond) {
            clearMotorMarkers();
            addMotorsToMap([updatedPond]);
          }
        }
      }, 500);
    },
    onError: (error: any) => {
      if (error?.status === 409) {
        toast.error(error?.data?.message);
      } else {
        setMotorErrorMessage(error?.data?.errors);
      }
    },
    retry: false,
  });

  const { mutate: deleteMotor, isPending: isDeletingMotorPending } =
    useMutation({
      mutationFn: ({ motorId, pondId }: { motorId: number; pondId: number }) =>
        deleteMotorAPI(motorId, pondId),
      onSuccess: async (_, { motorId, pondId }) => {
        toast.success("Motor deleted successfully!");

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["all-ponds"] }),
          queryClient.invalidateQueries({ queryKey: ["paginated-ponds"] }),
          queryClient.invalidateQueries({ queryKey: ["single-pond"] }),
          queryClient.invalidateQueries({ queryKey: ["user-devices"] }),
        ]);

        if (isPondEditing && selectedPondIndex !== null) {
          const updatedPonds = mapPonds.map((pond) => {
            if (pond.id !== pondId) return pond;
            return {
              ...pond,
              motors: pond.motors?.filter((m: Motor) => m.id !== motorId),
            };
          });
          clearMotorMarkers();
          addMotorsToMap(updatedPonds);
        }
      },
      onError: (error: any) => {
        if (error?.status === 409) {
          toast.error(error?.data?.message);
        }
      },
      retry: false,
    });

  const handleSaveMotor = (name: string, hp: string) => {
    if (!pendingMotorLocation || selectedPondIndex === null) return;
    const selectedPond = mapPonds[selectedPondIndex];
    addMotor({
      title: name || "",
      hp: hp || "",
      pond_id: selectedPond.id,
      location_id: selectedPond.location_id,
      motor_coordinates: pendingMotorLocation,
    });
  };

  const handleCloseDialog = () => {
    setIsAddingMotor(false);
    setIsDialogOpen(false);
    setPendingMotorLocation(null);
    setMotorName("");
    setMotorHp("");
    setMotorErrorMessage(null);
    tempMotorMarkerRef.current?.remove();
    tempMotorMarkerRef.current = null;
    selectedPondForMotorRef.current = null;
    if (mapPonds.length > 0) {
      addPondsToMap();
    }
  };

  const AddMotorMarkerToPond = useCallback((motor: any): mapboxgl.Marker | null => {
    if (!map.current) return null;
    const fullMotorData = motorDataMapRef.current.get(motor.id) || motor;
    const el = document.createElement("div");
    const root = createRoot(el);
    root.render(<MotorMarkerTooltip motor={fullMotorData} />);
    el.title = `${motor.name || "Unnamed Motor"} (${motor.power || "0"} HP)`;
    return new mapboxgl.Marker({ element: el })
      .setLngLat(motor.location)
      .addTo(map.current!);
  }, []);

  const {
    drawRef,
    pond,
    setPond,
    drawMode,
    handleLineStringMode,
    handlePolygonMode,
    handleEdit,
    handleDeletePond,
    handleUndo,
    handleRedo,
    handleAddMotor,
    handleDeleteMotor,
    handleMotorNameChange: hookHandleMotorNameChange,
    handleMotorPowerChange: hookHandleMotorPowerChange,
    locationCentroid,
    canUndo,
    canRedo,
    isAddingMotor: hookIsAddingMotor,
    removeMapLayers,
    mapEventHandlersRef,
    isPondEditing,
    setIsPondEditing,
    selectedMotorId
  } = useMapBox({
    map,
    isMapLoaded,
    isPondAdding: isPondAdding,
    setIsPondAdding: setIsPondAdding,
    AddMotorMarkerToPond,
    pondsLayersAddedRef,
  });

  const updateUrlWithPondId = useCallback((pondId: number | null) => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    if (pondId) {
      searchParams.set("pond", pondId.toString());
    } else {
      searchParams.delete("pond");
    }
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, []);

  const findPondIndexById = useCallback(
    (pondId: number, ponds: Pond[]): number => {
      return ponds.findIndex((pond) => pond.id === pondId);
    }, []);

  const createMotorMarker = useCallback((motor: Motor): mapboxgl.Marker | null => {
    if (!map.current || !isMapLoaded || editParam) return null;
    if (!motor.motor_coordinates || motor.motor_coordinates.lat == null || motor.motor_coordinates.lng == null) {
      return null;
    }
    try {
      const el = document.createElement("div");
      const root = createRoot(el);
      root.render(<MotorMarkerTooltip motor={motor} />);
      markerRootsRef.current.set(motor.id, { root, el });
      return new mapboxgl.Marker({ element: el })
        .setLngLat([motor.motor_coordinates.lng, motor.motor_coordinates.lat])
        .addTo(map.current);
    } catch (error) {
      console.error("Error creating motor marker:", error);
      return null;
    }
  },
    [isMapLoaded]);
  const updateMotorMarkers = useCallback((ponds: Pond[]) => {
    ponds.forEach((pond) => {
      if (pond.motors && Array.isArray(pond.motors)) {
        pond.motors.forEach((motor) => {
          const markerData = markerRootsRef.current.get(motor.id);
          if (markerData) {
            markerData.root.render(<MotorMarkerTooltip motor={motor} />);
          }
        });
      }
    });
  }, []);

  const clearMotorMarkers = useCallback(() => {
    motorMarkersRef.current.forEach((marker) => {
      try {
        marker.remove();
      } catch (error) {
        console.error("Error removing motor marker:", error);
      }
    });
    motorMarkersRef.current = [];

    markerRootsRef.current.forEach((markerData) => {
      try {
        markerData.root.unmount();
      } catch (error) {
        console.error("Error unmounting marker root:", error);
      }
    });
    markerRootsRef.current.clear();
  }, []);

  const addMotorsToMap = useCallback(
    (ponds: Pond[]) => {
      if (!map.current || !isMapLoaded) return;
      clearMotorMarkers();

      ponds.forEach((pond) => {
        if (
          pond.motors &&
          Array.isArray(pond.motors) &&
          typeof pond.id === "number"
        ) {
          pond.motors.forEach((motor) => {
            const marker = createMotorMarker(motor);
            if (marker) {
              motorMarkersRef.current.push(marker);
            }
          });
        }
      });
    },
    [isMapLoaded, createMotorMarker, clearMotorMarkers]
  );

  useEffect(() => {
    if (!isMapLoaded || !pondsLayersAddedRef.current) return;
    if (mapPonds.length > 0) {
      clearMotorMarkers();
      if (isPondEditing && selectedPondIndex !== null) {
        const selectedPond = mapPonds.find(
          (p) => p.id === mapPonds[selectedPondIndex]?.id
        );
        if (selectedPond) {
          addMotorsToMap([selectedPond]);
        }
      } else if (!isPondAdding && !isAddingMotor) {
        addMotorsToMap(mapPonds);
      }
    }
  }, [allPondsData, isPondEditing, selectedPondIndex, isMapLoaded, isPondAdding, isAddingMotor,]);

  const highlightPond = useCallback(
    (pondIndex: number | null) => {
      if (!map.current || !isMapLoaded || !pondsLayersAddedRef.current) return;
      requestAnimationFrame(() => {
        try {
          if (!map.current?.getLayer("ponds-fill")) return;
          const lineWidth = editParam ? 0 : 3;
          const activeOpacity = editParam ? 0.1 : 1;
          map.current.setPaintProperty("ponds-outline", "line-width", [
            "case", ["==", ["get", "pondIndex"], pondIndex ?? -1], lineWidth, 1,]);
          map.current.setPaintProperty("ponds-outline", "line-opacity", [
            "case", ["==", ["get", "pondIndex"], pondIndex ?? -1], activeOpacity, 0.9]);
          if (pondIndex !== null && mapPonds[pondIndex]) {
            setTimeout(() => {
              adjustPondZoom(map, isMapLoaded, pondIndex, mapPonds, isPondsTablePage);
            }, 100);
          }
        } catch (error) {
          console.error("Error highlighting pond:", error);
        }
      });
    },
    [isMapLoaded, mapPonds, map.current, isPondsTablePage]);



  const addPondsToMap = useCallback((pondsToDisplay?: Pond[]) => {
    if (!map.current || !isMapLoaded || isMotorSheet.current) return;
    const ponds = pondsToDisplay || mapPonds;
    if (ponds.length === 0) return;
    try {
      removeMapLayers();
      const pondColors = new Map<number, string>();
      ponds.forEach((pond) => {
        if (!pondColors.has(pond.id)) {
          pondColors.set(pond.id, generateRandomColor(pond.id));
        }
      });

      const features = ponds.map((pond) => {
        const pondIndex = mapPonds.findIndex((p) => p.id === pond.id);
        const pondColor = pondColors.get(pond.id) || "#0055ff";
        const capitalizedName = pond.title
          ? pond.title.charAt(0).toUpperCase() +
          pond.title.slice(1).toLowerCase()
          : "";
        return {
          type: "Feature" as const,
          properties: {
            name: capitalizedName,
            pondIndex: pondIndex,
            pondId: pond.id,
            motorCount: pond.motors?.length || 0,
            area: pond.acres ? `${pond.acres} Acres` : "0 Acres",
            pondColor: pondColor,
          },
          geometry: {
            type: "Polygon" as const,
            coordinates: [
              pond.pond_coordinates!.map((coord: PondCoordinate) => [
                coord.lng,
                coord.lat,
              ]),
            ],
          },
        };
      });

      map.current.addSource("ponds", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: features,
        },
      });

      map.current.addLayer({
        id: "ponds-fill",
        type: "fill",
        source: "ponds",
        paint: {
          "fill-color": ["get", "pondColor"],
          "fill-opacity": [
            "case",
            ["==", ["get", "pondIndex"], selectedPondIndex ?? -1],
            0.0,
            0.2,
          ],
        },
      });

      map.current.addLayer({
        id: "ponds-outline",
        type: "line",
        source: "ponds",
        paint: {
          "line-color": ["get", "pondColor"],
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 1,
            14, 3,
            18, 5
          ],
          "line-opacity": 0.95,
          "line-blur": 0.5,
        },
      });

      map.current.addLayer({
        id: "ponds-labels",
        type: "symbol",
        source: "ponds",
        layout: {
          "text-field": ["concat", ["get", "name"], "\n", ["get", "area"]],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],

          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12, 10,
            16, 16,
            20, 20
          ],
          "text-anchor": "center",
          "text-offset": [0, 0],
          "text-allow-overlap": false,
          "text-padding": 2,
          "text-max-width": 12,
        },
        paint: {
          "text-color": "#FFFFFF",
          "text-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 0.7,
            14, 1
          ]
        },
      });



      if (!isPondAdding && !isPondEditing) {
        const handlePondClick = (e: any) => {
          if (e.features && e.features.length > 0) {
            const clickedFeature = e.features[0];
            const pondIndex = clickedFeature.properties?.pondIndex;
            const pondId = clickedFeature.properties?.pondId;
            if (
              pondIndex !== undefined &&
              pondIndex !== null &&
              pondId !== undefined
            ) {
              setSelectedPondIndex(pondIndex);
              setShowDevices(true);
              setShowPondMotorsCard(true);
              updateUrlWithPondId(pondId);

              setTimeout(() => {
                adjustPondZoomWithResize(
                  map,
                  isMapLoaded,
                  pondIndex,
                  mapPonds,
                  isPondsTablePage
                );
              }, 100);
            }
          }
        };

        const handlePondMouseEnter = () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        };

        const handlePondMouseLeave = () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        };

        mapEventHandlersRef.current.click = handlePondClick;
        mapEventHandlersRef.current.mouseenter = handlePondMouseEnter;
        mapEventHandlersRef.current.mouseleave = handlePondMouseLeave;

        map.current.on("click", "ponds-fill", handlePondClick);
        map.current.on("mouseenter", "ponds-fill", handlePondMouseEnter);
        map.current.on("mouseleave", "ponds-fill", handlePondMouseLeave);
      }

      pondsLayersAddedRef.current = true;
      addMotorsToMap(ponds);

      if (urlPondId && selectedPondIndex === null) {
        const pondIndex = findPondIndexById(urlPondId, mapPonds);
        if (pondIndex !== -1) {
          setTimeout(() => {
            highlightPond(pondIndex);
            adjustPondZoom(
              map,
              isMapLoaded,
              pondIndex,
              mapPonds,
              isPondsTablePage
            );
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error adding ponds to map:", error);
    }
  },
    [
      isMapLoaded,
      mapPonds,
      removeMapLayers,
      addMotorsToMap,
      isPondAdding,
      isPondEditing,
      isAddingMotor,
      selectedPondIndex,
      updateUrlWithPondId,
      getPondIdFromUrl,
      findPondIndexById,
      highlightPond,
    ]
  );

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    try {
      let initialCenter: [number, number] = [
        80.95348556742668, 16.52338284974682,
      ];
      let initialZoom = 15;
      if (selectedLocation?.location_coordinates) {
        initialCenter = [
          selectedLocation.location_coordinates.lng,
          selectedLocation.location_coordinates.lat,
        ];
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: initialCenter,
        zoom: initialZoom,
        interactive: true,
        antialias: true,
        trackResize: true,
        attributionControl: false,
      });


      map.current.on("load", () => {
        if (!map.current) return;
        setIsMapLoaded(true);
        map.current.resize();
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
      map.current.addControl(new mapboxgl.FullscreenControl(), "bottom-right");

      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });
      map.current.addControl(geolocate, "bottom-right");
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (map.current) {
        clearMotorMarkers();
        removeMapLayers();
        map.current.remove();
        map.current = null;
        setIsMapLoaded(false);
        pondsLayersAddedRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !isMapLoaded || !selectedLocation?.location_coordinates) return;
    if (showPondMotorsCard) {
      updateUrlWithPondId(null);
      setTimeout(() => {
        setShowPondMotorsCard(false);
        setShowDevices(false);
        setSelectedPondIndex(null);
      }, 0);
    }

    if (editParam == null) {
      clearMotorMarkers();
      removeMapLayers();
      pondsLayersAddedRef.current = false;
      setSelectedPondIndex(null);
      setShowDevices(false);
      setShowPondMotorsCard(false);
      updateUrlWithPondId(null);
    }

    map.current.flyTo({
      center: [
        selectedLocation.location_coordinates.lng,
        selectedLocation.location_coordinates.lat,
      ],
      zoom: 15,
      duration: 1000,
    });
  }, [selectedLocation?.id, isMapLoaded]);

  useEffect(() => {
    if (editParam == null) return;
    if (!map.current || !isMapLoaded || !selectedLocation?.id) return;
    if (isPondAdding || isPondEditing || isAddingMotor) return;
    const timeoutId = setTimeout(() => {
      if (mapPonds.length > 0 && !pondsLayersAddedRef.current) {
        addPondsToMap();
      }
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [
    selectedLocation?.id,
    mapPonds.length,
    isMapLoaded,
    isPondAdding,
    isPondEditing,
    isAddingMotor,
    addPondsToMap,
    editParam,
  ]);

  useEffect(() => {
    if (!isMapLoaded || !map.current) return;
    const initializeMapPonds = () => {
      if (isAddingMotor && selectedPondForMotorRef.current) return;
      if (mapPonds.length > 0 && !pondsLayersAddedRef.current) {
        addPondsToMap();
        const urlPondId = getPondIdFromUrl();
        if (urlPondId) {
          const pondIndex = findPondIndexById(urlPondId, mapPonds);
          if (pondIndex !== -1) {
            setSelectedPondIndex(pondIndex);
            setShowDevices(true);
            setShowPondMotorsCard(true);
            highlightPond(pondIndex);
            adjustPondZoom(
              map,
              isMapLoaded,
              pondIndex,
              mapPonds,
              isPondsTablePage
            );
          }
        }
      }
      if (isAddingMotor && selectedPondForMotorRef.current) {
        addPondsToMap([selectedPondForMotorRef.current]);
      }
      if (
        pondsLayersAddedRef.current &&
        selectedPondIndex !== null &&
        !isPondAdding &&
        !isPondEditing &&
        !isAddingMotor
      ) {
        highlightPond(selectedPondIndex);
      }
    };

    const timeoutId = setTimeout(initializeMapPonds, 100);
    return () => clearTimeout(timeoutId);
  }, [
    isMapLoaded,
    mapPonds.length,
    isPondAdding,
    isPondEditing,
    isAddingMotor,
    selectedPondIndex,
    pondsLayersAddedRef,
  ]);

  useEffect(() => {
    if (
      !urlPondId ||
      mapPonds.length === 0 ||
      !isMapLoaded ||
      !pondsLayersAddedRef.current
    )
      return;

    const pondIndex = findPondIndexById(urlPondId, mapPonds);
    if (pondIndex === -1) return;
    setSelectedPondIndex(pondIndex);
    setShowDevices(true);
    setShowPondMotorsCard(true);
    highlightPond(pondIndex);
    adjustPondZoom(map, isMapLoaded, pondIndex, mapPonds, isPondsTablePage);
  }, [urlPondId, mapPonds.length, isMapLoaded]);

  const handleMotorPlacement = useCallback(
    (e: any) => {
      if (
        !isAddingMotor ||
        selectedPondIndex === null ||
        isPondAdding ||
        isPondEditing ||
        !map.current
      )
        return;

      const selectedPond = mapPonds[selectedPondIndex];
      if (!selectedPond?.pond_coordinates) return;

      const clickPoint = turf.point([e.lngLat.lng, e.lngLat.lat]);
      const pondCoordinates = selectedPond.pond_coordinates.map(
        (coord: PondCoordinate) => [coord.lng, coord.lat]
      );
      const pondPolygon = turf.polygon([pondCoordinates]);

      if (turf.booleanPointInPolygon(clickPoint, pondPolygon)) {
        const location = { lng: e.lngLat.lng, lat: e.lngLat.lat };
        const el = document.createElement("div");
        el.style.width = "28px";
        el.style.height = "28px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "yellow";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        el.style.border = "2px solid orange";

        const root = createRoot(el);
        root.render(<MotorIcon />);
        if (tempMotorMarkerRef.current) {
          tempMotorMarkerRef.current.remove();
        }

        tempMotorMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([location.lng, location.lat])
          .addTo(map.current);

        setPendingMotorLocation(location);
        setIsDialogOpen(true);
      } else {
        toast.warning("Please place the motor inside the pond area.");
      }
    },
    [isAddingMotor, selectedPondIndex, isPondAdding, isPondEditing, mapPonds]
  );

  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    if (isAddingMotor && !isPondAdding && !isPondEditing) {
      map.current.on("click", handleMotorPlacement);
    }
    return () => {
      if (map.current) {
        map.current.off("click", handleMotorPlacement);
      }
    };
  }, [
    isAddingMotor,
    isPondAdding,
    isPondEditing,
    isMapLoaded,
    handleMotorPlacement,
  ]);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showResults,
    selectLocation,
    clearSearch,
    lastSelectedFeatureRef,
  } = useMapboxSearch(map);

  const handleAddPondClick = () => {
    setShowDevices(false);
    setShowPondMotorsCard(false);
    setSelectedPondIndex(null);
    setIsPondAdding(true);
    setIsPondEditing(false);
    setPond(null);
    setErrorMessage(null);
    updateUrlWithPondId(null);
    setPondName("");
    const currentSearchParams = new URLSearchParams(search);
    if (currentSearchParams.get("add") !== "true") {
      addPondRef.current = true;
    }
    setTimeout(() => {
      if (mapPonds.length > 0) {
        addPondsToMap();
      }
    }, 100);
  };

  const handleEditPondClick = () => {
    if (selectedPondIndex === null) return;
    const selectedPond = mapPonds[selectedPondIndex];
    if (!selectedPond) return;
    originalPondRef.current = selectedPond;

    const pondCoordinates =
      selectedPond.pond_coordinates?.map((coord: any) => {
        if (Array.isArray(coord)) {
          return coord;
        } else {
          return [coord.lng, coord.lat];
        }
      }) || [];

    const motors =
      selectedPond.motors?.map((motor: any, index: number) => ({
        id: motor.id,
        name: motor.title || "",
        power: motor.hp || "",
        location: [
          motor.motor_coordinates?.lng || 0,
          motor.motor_coordinates?.lat || 0,
        ] as [number, number],
        motorId: index + 1,
      })) || [];

    const editPondData = {
      id: selectedPond.id,
      coordinates: pondCoordinates,
      area: parseFloat(selectedPond.acres) || 0,
      name: selectedPond.title || "",
      location: selectedPond.location_id,
      motors: motors,
    };

    setPond(editPondData);
    setPondName(selectedPond.title || "");
    setShowDevices(false);
    setShowPondMotorsCard(false);

    setIsPondEditing(true);
    setIsPondAdding(true);
    setErrorMessage(null);

    const hasBoundary = pondCoordinates.length > 0;

    if (hasBoundary) {
      setTimeout(() => {
        adjustPondZoom(map, isMapLoaded, selectedPondIndex, mapPonds, isPondsTablePage);

        setTimeout(() => {
          if (map.current && drawRef.current && pondCoordinates.length > 0) {
            try {
              const allFeatures = drawRef.current.getAll();
              allFeatures.features.forEach((feature: any) => {
                drawRef.current?.delete(feature.id);
              });

              const polygon = {
                id: selectedPond.id.toString(),
                type: "Feature" as const,
                properties: {},
                geometry: {
                  type: "Polygon" as const,
                  coordinates: [pondCoordinates],
                },
              };

              drawRef.current.add(polygon);

              setTimeout(() => {
                if (drawRef.current) {
                  drawRef.current.changeMode("simple_select");
                  toast.info("Drag motors to reposition. Click pond boundary to edit vertices.");
                }
              }, 100);
            } catch (error) {
              console.error("Error adding polygon to draw:", error);
              toast.error("Failed to initialize edit mode. Please try again.");
            }
          }
        }, 1100);
      }, 100);
    }
  };


  const handleAdddMotorClick = () => {
    setIsAddingMotor(true);
    if (selectedPondIndex !== null) {
      const selectedPond = mapPonds[selectedPondIndex];
      selectedPondForMotorRef.current = selectedPond;
      if (selectedPond && selectedPond.pond_coordinates) {
        addPondsToMap([selectedPond]);
      }
      toast.info("Click inside the pond area to add motor");
    }
  };

  const handleBackToPonds = () => {
    setShowDevices(false);
    setShowPondMotorsCard(false);
    setSelectedPondIndex(null);
    setIsAddingMotor(false);
    selectedPondForMotorRef.current = null;

    if (tempMotorMarkerRef.current) {
      tempMotorMarkerRef.current.remove();
      tempMotorMarkerRef.current = null;
    }

    addPondsToMap();
    resetMapToInitialZoom(map, isMapLoaded);
    updateUrlWithPondId(null);
  };



  const handleCancelEdit = useCallback(() => {
    setIsPondEditing(false);
    setIsPondAdding(false);
    if (pond) {
      handleDeletePond();
      setPond(null);
    }
    originalPondRef.current = null;

    setSelectedLocationId(null);
    setSelectedLocation(null);

    if (selectedPondIndex !== null) {
      setShowDevices(true);
      setShowPondMotorsCard(true);
      addPondsToMap();
      highlightPond(selectedPondIndex);
    }

    if (editParam && pond) {
      navigate({ to: `/ponds/${pond.id}` });
    } else if (addParam) {
      navigate({ to: `/ponds` });
    } else {
      addPondRef.current = false;
    }
  }, [pond, handleDeletePond, selectedPondIndex]);

  const handleMotorNameChange = (motorId: number, newName: string) => {
    hookHandleMotorNameChange(motorId, newName);

    if (!pond) return;
    const motorIndex = pond.motors.findIndex(
      (motor: any) => motor.id === motorId
    );
    if (motorIndex !== -1 && errorMessage?.[`motors[${motorIndex}].title`]) {
      setErrorMessage((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[`motors[${motorIndex}].title`];
        return newErrors;
      });
    }
  };

  const handleMotorPowerChange = (motorId: number, newPower: string) => {
    hookHandleMotorPowerChange(motorId, newPower);

    if (!pond) return;
    const motorIndex = pond.motors.findIndex(
      (motor: any) => motor.id === motorId
    );
    if (motorIndex !== -1 && errorMessage?.[`motors[${motorIndex}].hp`]) {
      setErrorMessage((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[`motors[${motorIndex}].hp`];
        return newErrors;
      });
    }
  };

  const handleChangePondsType = () => {
    if (isAdmin()) {
      return navigate({ to: `/users/${urlUserId}/ponds` });
    }
    if (!urlPondId) {
      navigate({ to: `/ponds` });
    } else {
      navigate({ to: `/ponds/${urlPondId}` });
    }
  };

  useEffect(() => {
    if (!isMapLoaded || !map.current?.isStyleLoaded()) return;

    if (
      addParam == "true" &&
      !isPondAdding &&
      !isPondEditing &&
      !addPondRef.current
    ) {
      handleAddPondClick();
    } else if (editParam == "true" && !isPondEditing) {
      const pondId = urlPondId || getPondIdFromUrl();
      if (pondId && mapPonds.length > 0) {
        const pondIndex = findPondIndexById(pondId, mapPonds);

        if (pondIndex !== -1) {
          if (selectedPondIndex !== pondIndex) {
            setSelectedPondIndex(pondIndex);
            setShowDevices(true);
          }
          if (selectedPondIndex !== null || pondIndex !== -1) {
            handleEditPondClick();
          }
        }
      }
    }
  }, [
    searchParams,
    isPondAdding,
    isPondEditing,
    isMapLoaded,
    selectedPondIndex,
    mapPonds.length,
  ]);

  useEffect(() => {
    const location =
      locations.find((loc) => loc.id === selectedLocationId) || null;
    setSelectedLocation(location);
  }, [selectedLocationId, locations]);

  useEffect(() => {
    if (!isMapLoaded || !map.current || !isPondAdding) return;

    if (mapPonds.length > 0) {
      const timeoutId = setTimeout(() => {
        addPondsToMap();
        resetMapToInitialZoom(map, isMapLoaded);
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedLocationId, isPondAdding, isMapLoaded, mapPonds.length]);

  const handleClosePondMotorsCard = () => {
    setShowPondMotorsCard(false);
    setShowDevices(false);
    setSelectedPondIndex(null);
    updateUrlWithPondId(null);
    highlightPond(null);

    if (mapPonds.length > 0) {
      addPondsToMap();
      resetMapToInitialZoom(map, isMapLoaded);
    }
  };


  useEffect(() => {
    if (!isMapLoaded || !pondsLayersAddedRef.current) return;
    if (mapPonds.length > 0 && motorMarkersRef.current.length > 0) {
      if (isPondEditing && selectedPondIndex !== null) {
        const selectedPond = mapPonds.find(
          (p) => p.id === mapPonds[selectedPondIndex]?.id
        );
        if (selectedPond) {
          updateMotorMarkers([selectedPond]);
        }
      } else if (!isPondAdding && !isAddingMotor) {
        updateMotorMarkers(mapPonds);
      }
    }
  }, [
    latestMotorControlAck,
    latestModeChangeAck,
    latestLiveData,
    mapPonds,
    isMapLoaded,
    isPondEditing,
    selectedPondIndex,
    isPondAdding,
    isAddingMotor,
    updateMotorMarkers,
  ]);

  useEffect(() => {
    if (selectedPond?.motors) {
      selectedPond.motors.forEach((motor: Motor) => {
        motorDataMapRef.current.set(motor.id, motor);
      });
    }
  }, [selectedPond]);

  const { isOwner, isManager, isAdmin } = useUserDetails();
  useEffect(() => {
    if (map.current && isMapLoaded) {
      setTimeout(() => {
        map.current?.resize();
      }, 300);
    }
  }, [showPondMotorsCard, isMapLoaded]);
  return (
    <div className="relative w-full h-[calc(100vh-49px)] flex flex-col overflow-y-hidden">
      <div className="flex flex-1 relative">
        <div
          className={`h-full transition-all duration-300 ease-in-out w-full      
            `}
        >
          {!isPondAdding && !isPondEditing && (
            <div className="absolute top-1 left-2 z-10 flex  gap-2">
              {!addParam && !editParam && !isPondAdding && <StatsList />}
              {showDevices
                ? (isOwner() || isManager()) && (
                  <button
                    className="flex shrink-0 items-center px-3 h-8 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    onClick={handleAdddMotorClick}
                    disabled={isAddingMotor}
                  >
                    {isAddingMotor ? "Adding..." : "+ Add Motor"}
                  </button>
                )
                : isOwner() && (
                  <button
                    className="flex shrink-0 items-center px-3 h-8 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    onClick={handleAddPondClick}
                  >
                    + Add Pond
                  </button>
                )}
            </div>
          )}
          {!showPondMotorsCard && (
            <MapSearchBox
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              isSearching={isSearching}
              showResults={showResults}
              selectLocation={selectLocation}
              clearSearch={clearSearch}
              lastSelectedFeatureRef={lastSelectedFeatureRef}
              isMapPage={true}
            />
          )}
          {(isPondAdding || isPondEditing) && (
            <>
              <MapIconsPage
                showResults={showResults}
                pond={pond}
                drawMode={drawMode}
                handleLineStringMode={handleLineStringMode}
                handlePolygonMode={handlePolygonMode}
                handleUndo={handleUndo}
                handleRedo={handleRedo}
                handleDeletePond={handleDeletePond}
                handleEdit={handleEdit}
                canUndo={canUndo}
                canRedo={canRedo}
                isPondEditing={isPondEditing}
              />

              {(!pond || !(pond?.coordinates && pond.coordinates.length > 0)) && !showResults && (
                <div className="absolute top-4 left-[470px] z-[9999] pointer-events-none animate-bounce-left">
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse">
                      <MoveLeft className="text-white" />
                    </span>
                    <span className="bg-[#3B82F6] text-[11px] rounded-md shadow-md font-medium text-gray-100 p-1">
                      {isPondEditing
                        ? "Edit the pond boundary"
                        : "Select any option to draw the boundary"}
                    </span>
                  </div>
                </div>
              )}


            </>
          )}
          {!addParam && !editParam && !addPondRef.current && !showPondMotorsCard && (
            <Button
              className="absolute top-1 right-2 z-10 bg-transparent bg-opacity-70 border border-white hover:bg-white-500 hover:bg-opacity-70 hover:border-white-500 text-white text-xs h-8 rounded-lg flex items-center gap-2"
              onClick={handleChangePondsType}
            >
              <LayoutIcon className="w-4 h-4" />
              Table View
            </Button>
          )}
          <div ref={mapContainer} className="w-full h-full" />
          {(isPondsLoading || isPondsRefetching || isLocationsLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/0 backdrop-blur-sm z-30">
              <MapLoader />
            </div>
          )}
        </div>

        {(isPondAdding || isPondEditing) && (
          <AddPondSideBar
            pond={pond}
            setPond={setPond}
            handleAddMotor={handleAddMotor}
            handleMotorNameChange={handleMotorNameChange}
            handleMotorPowerChange={handleMotorPowerChange}
            handleDeleteMotor={handleDeleteMotor}
            setIsPondAdding={setIsPondAdding}
            handleCancel={handleCancelEdit}
            isAddingMotor={hookIsAddingMotor}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            pondName={pondName}
            setPondName={setPondName}
            locationCentroid={locationCentroid}
            setIsPondEditing={setIsPondEditing}
            originalPond={originalPondRef.current}
            isPondEditing={isPondEditing}
            deleteMotor={deleteMotor}
            isDeletingMotorPending={isDeletingMotorPending}
            addParam={addParam}
            setSelectedLocation={setSelectedLocation}
            setSelectedLocationId={setSelectedLocationId}
            selectedMotorId={selectedMotorId}
            addPondsToMap={addPondsToMap}
          />
        )}
        {!(isPondAdding || isPondEditing) && showPondMotorsCard && (
          <div className="hidden lg:block w-3/5 h-full">
            <PondMotorsCard
              selectedPond={selectedPond}
              onClose={handleClosePondMotorsCard}
              selectedPondIndex={selectedPondIndex}
              mapPonds={mapPonds}
              dateRange={dateRange}
              setDateRange={setDateRange}
              pondMotors={selectedPond?.motors}
              handleBackToPonds={handleBackToPonds}
              handleMotorContorlPublish={handleMotorContorlPublish}
              handleMotorModePublish={handleMotorModePublish}
              motors={motors?.motors}
              isSinglePondLoading={isSinglePondLoading}
              deleteMotor={deleteMotor}
              isDeletingMotorPending={isDeletingMotorPending}


            />
          </div>
        )}
      </div>
      <AddMotorDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveMotor}
        motorLocation={pendingMotorLocation}
        isPending={isAddingMotorPending}
        motorErrorMessage={motorErrorMessage}
        setMotorErrorMessage={setMotorErrorMessage}
        motorName={motorName}
        setMotorName={setMotorName}
        motorHp={motorHp}
        setMotorHp={setMotorHp}
      />
    </div>
  );
};

export default pondsMapView;
