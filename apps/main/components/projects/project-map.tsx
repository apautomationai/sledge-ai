"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

import { ProjectWithCoordinates } from "@/lib/data/projects";

interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

interface MarkerPosition {
    x: number;
    y: number;
}

interface ProjectMapProps {
    projects: ProjectWithCoordinates[];
    onMarkerClick: (projectId: number, position: MarkerPosition) => void;
    onBoundsChange?: (bounds: MapBounds) => void;
}

export interface ProjectMapRef {
    panToProject: (coordinates: { lat: number; lng: number }) => void;
}

declare global {
    interface Window {
        google: any;
    }
}

export const ProjectMap = forwardRef<ProjectMapRef, ProjectMapProps>(
    ({ projects, onMarkerClick, onBoundsChange }, ref) => {
        const mapRef = useRef<HTMLDivElement>(null);
        const googleMapRef = useRef<any>(null);
        const markersRef = useRef<any[]>([]);

        // Load Google Maps script
        useEffect(() => {
            const loadGoogleMaps = () => {
                if (window.google) {
                    initializeMap();
                    return;
                }

                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
                script.async = true;
                script.defer = true;
                script.onload = () => initializeMap();
                document.head.appendChild(script);
            };

            loadGoogleMaps();
        }, []);

        // Update markers when projects change
        useEffect(() => {
            if (googleMapRef.current) {
                updateMarkers();
            }
        }, [projects]);

        const initializeMap = () => {
            if (!mapRef.current || !window.google) return;

            // Center on US
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 39.8283, lng: -98.5795 },
                zoom: 4,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }],
                    },
                ],
            });

            googleMapRef.current = map;

            // Add bounds change listener with debouncing
            let boundsTimeout: NodeJS.Timeout;
            map.addListener("bounds_changed", () => {
                clearTimeout(boundsTimeout);
                boundsTimeout = setTimeout(() => {
                    filterProjectsByBounds();
                }, 300); // 300ms debounce
            });

            // Call initial bounds after map is loaded
            map.addListener("idle", () => {
                filterProjectsByBounds();
            });

            updateMarkers();
        };

        const filterProjectsByBounds = () => {
            if (!googleMapRef.current || !window.google || !onBoundsChange) return;

            const bounds = googleMapRef.current.getBounds();
            if (!bounds) return;

            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();

            const mapBounds: MapBounds = {
                north: ne.lat(),
                south: sw.lat(),
                east: ne.lng(),
                west: sw.lng(),
            };

            onBoundsChange(mapBounds);
        };

        const updateMarkers = () => {
            if (!googleMapRef.current || !window.google) return;

            // Clear existing markers
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current = [];

            // Add new markers
            projects.forEach((project) => {
                const marker = new window.google.maps.Marker({
                    position: project.coordinates,
                    map: googleMapRef.current,
                    title: `${project.name} - ${project.address}`,
                });

                marker.addListener("click", (event: any) => {
                    // Get the marker's screen position from the DOM event
                    let markerPosition: MarkerPosition;

                    if (event.domEvent && mapRef.current) {
                        // Use the actual click coordinates
                        markerPosition = {
                            x: event.domEvent.clientX,
                            y: event.domEvent.clientY
                        };
                    } else if (mapRef.current) {
                        // Fallback: use map center
                        const mapRect = mapRef.current.getBoundingClientRect();
                        markerPosition = {
                            x: mapRect.left + mapRect.width / 2,
                            y: mapRect.top + mapRect.height / 2
                        };
                    } else {
                        // Final fallback
                        markerPosition = { x: 0, y: 0 };
                    }

                    onMarkerClick(project.id, markerPosition);
                    googleMapRef.current.panTo(project.coordinates);
                    googleMapRef.current.setZoom(15);
                });

                markersRef.current.push(marker);
            });
        };

        // Expose methods to parent component
        useImperativeHandle(ref, () => ({
            panToProject: (coordinates: { lat: number; lng: number }) => {
                if (googleMapRef.current) {
                    googleMapRef.current.panTo(coordinates);
                    googleMapRef.current.setZoom(15);
                }
            },
        }));

        return <div ref={mapRef} className="h-full w-full" />;
    }
);

ProjectMap.displayName = "ProjectMap";
