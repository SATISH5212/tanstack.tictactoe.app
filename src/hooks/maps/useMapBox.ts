import { UseMapBoxProps } from "@/lib/interfaces/maps";
import { MotorAddData, PondData } from "@/lib/interfaces/maps/ponds";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const useMotorState = () => {
    const [isAddingMotor, setIsAddingMotor] = useState(false);
    return { isAddingMotor, setIsAddingMotor };
};

export const useMapBox = ({
    map,
    isMapLoaded,
    isPondAdding,
    setIsPondAdding,
    AddMotorMarkerToPond,
    pondsLayersAddedRef,
}: UseMapBoxProps) => {
    const drawRef = useRef<MapboxDraw | null>(null);
    const [pond, setPond] = useState<PondData | null>(null);
    const [drawMode, setDrawMode] = useState("simple_select");
    const motorState = useMotorState();
    const [isPondEditing, setIsPondEditing] = useState(false);
    const historyRef = useRef<any[]>([]);
    const redoHistoryRef = useRef<any[]>([]);
    const lastFeatureStateRef = useRef<any>(null);
    const isEditingRef = useRef(false);
    const pondRef = useRef<PondData | null>(null);
    const isAddingMotorRef = useRef(false);
    const nextMotorIdRef = useRef(0);

    const motorMarkersRef = useRef<mapboxgl.Marker[]>([]);
    const motorRootsRef = useRef<Map<number, any>>(new Map());
    const [locationCentroid, setLocationCentroid] = useState([0, 0]);
    const mapEventHandlersRef = useRef<{
        click?: (e: any) => void;
        mouseenter?: () => void;
        mouseleave?: () => void;
    }>({});

    const [isDraggingMotor, setIsDraggingMotor] = useState(false);
    const draggingMotorRef = useRef<{ id: number; marker: mapboxgl.Marker } | null>(null);
    const [selectedMotorId, setSelectedMotorId] = useState<number | null>(null);

    const isEditModeFromURL = useCallback(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('edit') === 'true';
        }
        return false;
    }, []);

    useEffect(() => {
        pondRef.current = pond;
    }, [pond]);

    useEffect(() => {
        isAddingMotorRef.current = motorState.isAddingMotor;
    }, [motorState.isAddingMotor]);

    useEffect(() => {
        if (!map.current || drawRef.current) return;

        const draw = new MapboxDraw({
            displayControlsDefault: false,
        });
        drawRef.current = draw;
    }, [map.current]);

    const clearMotorMarkers = useCallback(() => {
        motorMarkersRef.current.forEach((marker) => {
            try {
                marker.remove();
            } catch (error) {
                console.error("Error removing motor marker:", error);
            }
        });
        motorMarkersRef.current = [];

        motorRootsRef.current.forEach((root) => {
            try {
                root.unmount();
            } catch (error) {
                console.error("Error unmounting marker root:", error);
            }
        });
        motorRootsRef.current.clear();
    }, []);

    const addOrDeleteMotors = useCallback((motors: MotorAddData[], enableDragging = false) => {
        if (!isDraggingMotor) {
            clearMotorMarkers();
        }
        const shouldEnableDragging = enableDragging || isEditModeFromURL();
        motors.forEach(motor => {
            if (isDraggingMotor && draggingMotorRef.current?.id === motor.id) {
                return;
            }
            const marker = AddMotorMarkerToPond(motor);
            if (!marker) return;
            motorMarkersRef.current.push(marker);

            const element = marker.getElement();
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                setSelectedMotorId(motor.id);
            });

            if (shouldEnableDragging) {
                marker.setDraggable(true);
                element.style.cursor = 'grab';
                element.title = `${motor.name || 'Motor'} - Drag to reposition`;

                marker.on('dragstart', () => {
                    setSelectedMotorId(motor.id);
                    setIsDraggingMotor(true);
                    draggingMotorRef.current = { id: motor.id, marker };
                    element.style.cursor = 'grabbing';
                    element.style.opacity = '0.6';
                    if (drawRef.current) {
                        drawRef.current.changeMode('simple_select');
                    }
                });

                marker.on('drag', () => {
                    const lngLat = marker.getLngLat();
                });

                marker.on('dragend', () => {
                    const newLngLat = marker.getLngLat();
                    element.style.cursor = 'grab';
                    element.style.opacity = '1';

                    if (pondRef.current) {
                        const clickPoint = turf.point([newLngLat.lng, newLngLat.lat]);
                        const pondPolygon = turf.polygon([pondRef.current.coordinates]);

                        if (turf.booleanPointInPolygon(clickPoint, pondPolygon)) {
                            const updatedMotors = pondRef.current.motors.map(m =>
                                m.id === motor.id
                                    ? { ...m, location: [newLngLat.lng, newLngLat.lat] as [number, number] }
                                    : m
                            );
                            setPond({
                                ...pondRef.current,
                                motors: updatedMotors
                            });
                        } else {
                            marker.setLngLat(motor.location);
                            toast.warning('Motor must be inside the pond area');
                        }
                    }
                    setTimeout(() => {
                        setIsDraggingMotor(false);
                        draggingMotorRef.current = null;
                    }, 100);
                });
            }
        });
    }, [AddMotorMarkerToPond, clearMotorMarkers, isEditModeFromURL, isDraggingMotor]);


    const RemoveAllMotorMarkers = useCallback(() => {
        clearMotorMarkers();
    }, [clearMotorMarkers]);

    const processDrawNewPond = useCallback((feature: any) => {
        let polygon: any = null;

        if (feature.geometry.type == "Polygon") {
            polygon = feature;
        } else if (feature.geometry.type === "LineString") {
            const coords = [...feature.geometry.coordinates];
            if (coords[0][0] !== coords[coords.length - 1][0] ||
                coords[0][1] !== coords[coords.length - 1][1]) {
                coords.push(coords[0]);
            }
            polygon = turf.polygon([coords], { id: feature.id });
            drawRef.current?.delete(feature.id);
            drawRef.current?.add(polygon);
        }

        if (polygon) {
            const id = polygon.id || feature.id;
            const area = turf.area(polygon) / 4046.86;
            const centroid = turf.centroid(polygon);
            setLocationCentroid(centroid?.geometry?.coordinates);

            if (isPondEditing && pondRef.current) {
                const polygonCoords = polygon.geometry.coordinates[0];
                const polygonFeature = turf.polygon([polygonCoords]);
                const getRandomPointInsidePolygon = () => {
                    const bbox = turf.bbox(polygonFeature);
                    let point;
                    let isInside = false;
                    while (!isInside) {
                        const randomPoint = turf.randomPoint(1, { bbox }).features[0];
                        isInside = turf.booleanPointInPolygon(randomPoint, polygonFeature);
                        if (isInside) point = randomPoint.geometry.coordinates;
                    }

                    return point as [number, number];
                };

                const updatedMotors = pondRef.current.motors.map(m => {
                    const isZero = m.location?.[0] === 0 && m.location?.[1] === 0;

                    if (!isZero) return m;

                    const randomLoc = getRandomPointInsidePolygon();

                    return {
                        ...m,
                        location: randomLoc
                    };
                });

                setPond({
                    ...pondRef.current,
                    coordinates: polygonCoords,
                    motors: updatedMotors
                });

                addOrDeleteMotors(updatedMotors, isPondEditing);
            } else {
                const newPond: PondData = {
                    id,
                    coordinates: polygon.geometry.coordinates[0],
                    area: Math.round(area * 100) / 100,
                    name: "",
                    location: undefined,
                    motors: []
                };

                setPond(newPond);
            }

            historyRef.current = [JSON.parse(JSON.stringify(polygon))];
            redoHistoryRef.current = [];
            lastFeatureStateRef.current = JSON.parse(JSON.stringify(polygon));
        }
        setDrawMode("simple_select");
    }, [isPondEditing, addOrDeleteMotors]);

    const processUpdatePond = useCallback((feature: any) => {
        if (isDraggingMotor) {
            return;
        }

        const currentCoords = JSON.stringify(feature.geometry.coordinates);
        const lastCoords = JSON.stringify(lastFeatureStateRef.current?.geometry?.coordinates);

        if (currentCoords !== lastCoords) {
            const featureClone = JSON.parse(JSON.stringify(feature));
            historyRef.current.push(featureClone);
            redoHistoryRef.current = [];
            lastFeatureStateRef.current = featureClone;

            const area = turf.area(feature) / 4046.86;
            const centroid = turf.centroid(feature);
            setLocationCentroid(centroid?.geometry?.coordinates);

            setPond(prev => prev ? {
                ...prev,
                coordinates: feature.geometry.coordinates[0],
                area: Math.round(area * 100) / 100
            } : null);
        }
    }, [isDraggingMotor]);

    const handleLineStringMode = useCallback(() => {
        if (!drawRef.current || (pond?.coordinates !== undefined && pond.coordinates.length > 0)) return;
        drawRef.current.changeMode("draw_line_string");
        setDrawMode("draw_line_string");
        motorState.setIsAddingMotor(false);
    }, [pond]);

    const handlePolygonMode = useCallback(() => {
        if (!drawRef.current || (pond?.coordinates !== undefined && pond.coordinates.length > 0)) return;
        drawRef.current.changeMode("draw_polygon");
        setDrawMode("draw_polygon");
        motorState.setIsAddingMotor(false);
    }, [pond]);

    const handleDeletePond = useCallback(() => {
        if (!drawRef.current || !pond) return;

        const allFeatures = drawRef.current.getAll();
        allFeatures.features.forEach((feature: any) => {
            drawRef.current?.delete(feature.id);
        });

        drawRef.current.delete(pond.id);
        clearMotorMarkers();

        setPond(null);
        historyRef.current = [];
        redoHistoryRef.current = [];
        lastFeatureStateRef.current = null;
        motorState.setIsAddingMotor(false);
        setSelectedMotorId(null)

        drawRef.current.changeMode("simple_select");
        setDrawMode("simple_select");
    }, [pond, clearMotorMarkers]);

    const handleUndo = useCallback(() => {
        if (!pond || !drawRef.current || historyRef.current.length <= 1) return;

        const currentState = historyRef.current.pop()!;
        redoHistoryRef.current.push(currentState);
        const previousState = historyRef.current[historyRef.current.length - 1];
        if (!previousState) return;

        drawRef.current.delete(pond.id);
        drawRef.current.add(previousState);
        lastFeatureStateRef.current = JSON.parse(JSON.stringify(previousState));

        const area = turf.area(previousState) / 4046.86;
        const centroid = turf.centroid(previousState);
        setLocationCentroid(centroid?.geometry?.coordinates);

        setPond(prev => prev ? {
            ...prev,
            coordinates: previousState.geometry.coordinates[0],
            area: Math.round(area * 100) / 100
        } : null);

        setTimeout(() => {
            drawRef.current?.changeMode("direct_select", { featureId: pond.id });
        }, 50);
    }, [pond]);

    const handleRedo = useCallback(() => {
        if (!pond || !drawRef.current || redoHistoryRef.current.length === 0) return;

        const nextState = redoHistoryRef.current.pop()!;
        historyRef.current.push(nextState);
        lastFeatureStateRef.current = JSON.parse(JSON.stringify(nextState));

        drawRef.current.delete(pond.id);
        drawRef.current.add(nextState);

        const area = turf.area(nextState) / 4046.86;
        const centroid = turf.centroid(nextState);
        setLocationCentroid(centroid?.geometry?.coordinates);

        setPond(prev => prev ? {
            ...prev,
            coordinates: nextState.geometry.coordinates[0],
            area: Math.round(area * 100) / 100
        } : null);

        setTimeout(() => {
            drawRef.current?.changeMode("direct_select", { featureId: pond.id });
        }, 50);
    }, [pond]);

    const handleCancel = useCallback(() => {
        setIsPondAdding(false);
        isPondEditing && setIsPondEditing(false);
        if (pond) {
            handleDeletePond();
            setPond(null);
        }
        clearMotorMarkers();
        setSelectedMotorId(null);
    }, [pond, handleDeletePond, setIsPondAdding, clearMotorMarkers, isPondEditing]);

    const handleMotorPlacement = useCallback((e: any) => {
        if (!pondRef.current) return;
        if (!pondRef.current.coordinates || pondRef.current.coordinates.length === 0) {
            toast.warning("Please draw a pond boundary first before adding motors.");
            return;
        }

        const clickPoint = turf.point([e.lngLat.lng, e.lngLat.lat]);
        const pondPolygon = turf.polygon([pondRef.current.coordinates]);

        if (turf.booleanPointInPolygon(clickPoint, pondPolygon)) {
            const location: [number, number] = [e.lngLat.lng, e.lngLat.lat];

            const newMotor: MotorAddData = {
                id: nextMotorIdRef.current,
                name: undefined,
                power: undefined,
                location: location,
                motorId: pondRef.current.motors.length + 1
            };
            nextMotorIdRef.current += 1;

            const updatedPond = {
                ...pondRef.current,
                motors: [...pondRef.current.motors, newMotor]
            };

            setPond(updatedPond);
            addOrDeleteMotors(updatedPond.motors, isPondEditing);
            motorState.setIsAddingMotor(false);
            setSelectedMotorId(newMotor.id);
        } else {
            toast.warning("Please place the motor inside the pond area.");
        }
    }, [addOrDeleteMotors, isPondEditing]);

    const handleAddMotor = useCallback(() => {
        if (!pond) return;
        motorState.setIsAddingMotor(true);
        if (drawRef.current) {
            drawRef.current.changeMode("simple_select");
        }
    }, [pond]);

    const handleDeleteMotor = useCallback((motorId: number) => {
        if (!pond) return;

        const updatedMotors = pond.motors.filter(motor => motor.id !== motorId);
        const updatedPond = {
            ...pond,
            motors: updatedMotors.map((motor, index) => ({
                ...motor,
                motorId: index + 1
            }))
        };

        setPond(updatedPond);
        addOrDeleteMotors(updatedPond.motors, isPondEditing);
        if (selectedMotorId === motorId) {
            setSelectedMotorId(null);
        }
    }, [pond, addOrDeleteMotors, isPondEditing, selectedMotorId]);

    const handleMotorNameChange = useCallback((motorId: number, newName: string) => {
        if (!pond) return;

        const updatedMotors = pond.motors.map(motor =>
            motor.id === motorId ? { ...motor, name: newName } : motor
        );

        setPond({
            ...pond,
            motors: updatedMotors
        });

        addOrDeleteMotors(updatedMotors, isPondEditing);
    }, [pond, addOrDeleteMotors, isPondEditing]);

    const handleMotorPowerChange = useCallback((motorId: number, newPower: string) => {
        if (!pond) return;
        const updatedMotors = pond.motors.map(motor =>
            motor.id === motorId ? { ...motor, power: newPower } : motor
        );
        setPond({
            ...pond,
            motors: updatedMotors
        });
        addOrDeleteMotors(updatedMotors, isPondEditing);
    }, [pond, addOrDeleteMotors, isPondEditing]);

    useEffect(() => {
        if (!pond || !pond.motors || pond.motors.length === 0) return;

        const shouldEnableDragging = isEditModeFromURL();
        if (!shouldEnableDragging) return;
        const timeoutId = setTimeout(() => {
            if (pond.motors.length > 0) {
                addOrDeleteMotors(pond.motors, true);
            }
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [pond?.id, pond?.motors?.length, isEditModeFromURL]);

    useEffect(() => {
        if (!map.current || !isMapLoaded || !drawRef.current) return;

        if (isPondAdding) {
            if (!map.current.hasControl(drawRef.current)) {
                map.current.addControl(drawRef.current);
            }

            const debounce = (fn: Function, delay: number) => {
                let timeoutId: NodeJS.Timeout;
                return (...args: any[]) => {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => fn(...args), delay);
                };
            };

            const handleDrawCreate = (e: any) => {
                const feature = e.features[0];
                if (!feature) return;

                if (pondRef.current && isPondEditing) {
                    processDrawNewPond(feature);
                } else {
                    if (pondRef.current) {
                        handleDeletePond();
                    }
                    processDrawNewPond(feature);
                }
            };

            const handleDrawUpdate = debounce((e: any) => {
                if (isDraggingMotor) {
                    return;
                }

                const feature = e.features[0];
                if (!feature?.id || !pondRef.current) return;
                processUpdatePond(feature);
            }, 100);

            const handleDrawModeChange = (e: any) => {
                setDrawMode(e.mode);
                isEditingRef.current = e.mode === "direct_select";
            };

            const handleMapMouseDown = (e: any) => {
                if (isEditingRef.current || isDraggingMotor) {
                    return;
                }

                if (isAddingMotorRef.current && pondRef.current) {
                    handleMotorPlacement(e);
                    e.preventDefault();
                    e.stopPropagation();
                }
            };

            map.current.on("draw.create", handleDrawCreate);
            map.current.on("draw.update", handleDrawUpdate);
            map.current.on("draw.modechange", handleDrawModeChange);
            map.current.on("mousedown", handleMapMouseDown);

            return () => {
                if (map.current) {
                    map.current.off("draw.create", handleDrawCreate);
                    map.current.off("draw.update", handleDrawUpdate);
                    map.current.off("draw.modechange", handleDrawModeChange);
                    map.current.off("mousedown", handleMapMouseDown);
                }
            };
        } else {
            if (drawRef.current && map.current.hasControl(drawRef.current)) {
                map.current.removeControl(drawRef.current);
            }
            if (pond) {
                handleDeletePond();
            }
        }
    }, [isPondAdding, isMapLoaded, pond, isPondEditing, isDraggingMotor, handleDeletePond, processDrawNewPond, processUpdatePond, handleMotorPlacement]);

    const removeMapLayers = useCallback(() => {
        if (!map.current || !isMapLoaded) return;
        if (!map.current.isStyleLoaded()) return;

        if (mapEventHandlersRef.current.click) {
            try {
                map.current.off("click", "ponds-fill", mapEventHandlersRef.current.click as any);
            } catch (e) {
                console.error("Error removing click handler:", e);
            }
        }
        if (mapEventHandlersRef.current.mouseenter) {
            try {
                map.current.off("mouseenter", "ponds-fill", mapEventHandlersRef.current.mouseenter as any);
            } catch (e) {
                console.error("Error removing mouseenter handler:", e);
            }
        }
        if (mapEventHandlersRef.current.mouseleave) {
            try {
                map.current.off("mouseleave", "ponds-fill", mapEventHandlersRef.current.mouseleave as any);
            } catch (e) {
                console.error("Error removing mouseleave handler:", e);
            }
        }

        mapEventHandlersRef.current = {};

        const layersToRemove = ['ponds-fill', 'ponds-outline', 'ponds-labels'];

        layersToRemove.forEach(layerId => {
            try {
                if (map.current!.getLayer(layerId)) {
                    map.current!.removeLayer(layerId);
                }
            } catch (error) {
                console.error(`Error removing layer ${layerId}:`, error);
            }
        });

        try {
            if (map.current.getSource('ponds')) {
                map.current.removeSource('ponds');
            }
        } catch (error) {
            console.error("Error removing ponds source:", error);
        }

        pondsLayersAddedRef.current = false;
    }, [isMapLoaded]);

    const handleEdit = useCallback(() => {
        if (!drawRef.current || !pond) return;
        removeMapLayers();

        const allFeatures = drawRef.current.getAll();
        const featureExists = allFeatures.features.some((f: any) => f.id === pond.id);
        const hasBoundary = pond.coordinates && pond.coordinates.length > 0;

        if (!featureExists && hasBoundary) {
            const polygon = turf.polygon([pond.coordinates], { id: pond.id });

            try {
                drawRef.current.add(polygon);

                const polygonClone = JSON.parse(JSON.stringify(polygon));
                historyRef.current = [polygonClone];
                redoHistoryRef.current = [];
                lastFeatureStateRef.current = polygonClone;
            } catch (error) {
                console.error("Error adding polygon to draw control:", error);
                toast.error("Failed to initialize edit mode. Please try again.");
                return;
            }
        } else if (!hasBoundary) {
            toast.info("Please draw a boundary for this pond using the drawing tools.");
            historyRef.current = [];
            redoHistoryRef.current = [];
            lastFeatureStateRef.current = null;
            return;
        }

        if (hasBoundary && pond.motors.length > 0) {
            addOrDeleteMotors(pond.motors, true);
        }

        toast.info(hasBoundary
            ? "You can edit the pond boundary and drag motors to reposition them."
            : "Draw a boundary first, then you can add motors."
        );

        drawRef.current.changeMode("simple_select");
        if (hasBoundary) {
            setTimeout(() => {
                if (!drawRef.current || !pond) return;

                try {
                    const features = drawRef.current.getAll();
                    const feature = features?.features?.find((f: any) => f.id == pond.id);
                    if (feature) {
                        drawRef.current.changeMode("direct_select", { featureId: pond.id });
                        setDrawMode("direct_select");
                    } else {
                        console.error("Feature not found in draw control after adding");

                    }
                } catch (error) {
                    console.error("Error entering direct_select mode:", error);
                }
            }, 200);
        }

        motorState.setIsAddingMotor(false);
    }, [pond, removeMapLayers, motorState, addOrDeleteMotors]);

    const canUndo = pond && historyRef.current.length > 1;
    const canRedo = pond && redoHistoryRef.current.length > 0;
    return {
        drawRef,
        pond,
        setPond,
        drawMode,
        processDrawNewPond,
        processUpdatePond,
        handleLineStringMode,
        handlePolygonMode,
        handleEdit,
        handleDeletePond,
        handleUndo,
        handleRedo,
        handleCancel,
        handleAddMotor,
        handleDeleteMotor,
        handleMotorNameChange,
        handleMotorPowerChange,
        historyRef,
        redoHistoryRef,
        locationCentroid,
        canUndo,
        canRedo,
        isAddingMotor: motorState.isAddingMotor,
        setIsAddingMotor: motorState.setIsAddingMotor,
        RemoveAllMotorMarkers,
        removeMapLayers,
        mapEventHandlersRef,
        isPondEditing,
        setIsPondEditing,
        isDraggingMotor,
        selectedMotorId,
        setSelectedMotorId,
    };
};