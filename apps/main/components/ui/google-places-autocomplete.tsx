"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { Input } from "@workspace/ui/components/input";

const libraries: ("places")[] = ["places"];

interface GooglePlacesAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onPlaceSelect?: (place: {
        formattedAddress: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        latitude: number;
        longitude: number;
    }) => void;
    placeholder?: string;
    className?: string;
}

export function GooglePlacesAutocomplete({
    value,
    onChange,
    onPlaceSelect,
    placeholder = "Enter project address",
    className,
}: GooglePlacesAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
    const isSelectingRef = useRef(false);
    const onChangeRef = useRef(onChange);
    const onPlaceSelectRef = useRef(onPlaceSelect);

    // Keep refs updated
    useEffect(() => {
        onChangeRef.current = onChange;
        onPlaceSelectRef.current = onPlaceSelect;
    }, [onChange, onPlaceSelect]);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    // Memoize the place changed handler to prevent recreating it
    const handlePlaceChanged = useCallback(() => {
        console.log('=== handlePlaceChanged CALLED ===');
        isSelectingRef.current = true;
        const place = autocompleteRef.current?.getPlace();

        console.log('Place object:', place);

        if (!place) {
            console.log('No place object');
            isSelectingRef.current = false;
            return;
        }

        if (!place.address_components) {
            console.log('No address_components, place:', place);
            // User might have pressed enter on a partial match
            // Use the formatted_address or name if available
            if (place.formatted_address || place.name) {
                const addressToUse = place.formatted_address || place.name || '';
                if (inputRef.current) {
                    inputRef.current.value = addressToUse;
                }
                if (onChangeRef.current) {
                    onChangeRef.current(addressToUse);
                }
            }
            isSelectingRef.current = false;
            return;
        }

        const addressComponents = place.address_components;
        let address = "";
        let city = "";
        let state = "";
        let postalCode = "";
        let country = "";

        console.log('Address components:', addressComponents);

        // Extract address components
        addressComponents.forEach((component) => {
            const types = component.types;

            if (types.includes("street_number")) {
                address = component.long_name + " ";
            }
            if (types.includes("route")) {
                address += component.long_name;
            }
            if (types.includes("locality")) {
                city = component.long_name;
            }
            if (types.includes("administrative_area_level_1")) {
                state = component.short_name;
            }
            if (types.includes("postal_code")) {
                postalCode = component.long_name;
            }
            if (types.includes("country")) {
                country = component.long_name;
            }
        });

        console.log('Extracted components:', {
            address: address.trim(),
            city,
            state,
            postalCode,
            country
        });

        const latitude = place.geometry?.location?.lat() || 0;
        const longitude = place.geometry?.location?.lng() || 0;

        // Update the input value with formatted address
        const formattedAddress = place.formatted_address || address;

        console.log('=== GOOGLE PLACES SELECTED ===');
        console.log('Formatted address:', formattedAddress);

        // Update the input element directly
        if (inputRef.current) {
            inputRef.current.value = formattedAddress;
            console.log('Input value set to:', inputRef.current.value);
        }

        // Update parent state using ref
        if (onChangeRef.current) {
            onChangeRef.current(formattedAddress);
            console.log('Called onChange with:', formattedAddress);
        }

        // Call the callback with extracted data using ref
        console.log('About to call onPlaceSelectRef.current');
        console.log('onPlaceSelectRef.current exists?', !!onPlaceSelectRef.current);

        if (onPlaceSelectRef.current) {
            const dataToSend = {
                formattedAddress,
                address: address.trim(),
                city,
                state,
                postalCode,
                country,
                latitude,
                longitude,
            };
            console.log('Calling onPlaceSelect with:', dataToSend);
            onPlaceSelectRef.current(dataToSend);
        } else {
            console.log('onPlaceSelectRef.current is null/undefined!');
        }

        setTimeout(() => {
            isSelectingRef.current = false;
        }, 100);
    }, []);

    useEffect(() => {
        if (!isLoaded || !inputRef.current || isInitialized) return;

        console.log('=== INITIALIZING GOOGLE PLACES ===');

        // Initialize autocomplete only once
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ["address"],
            fields: ["address_components", "formatted_address", "geometry"],
        });

        console.log('Autocomplete created:', autocompleteRef.current);

        setIsInitialized(true);

        // Add place changed listener
        listenerRef.current = autocompleteRef.current.addListener("place_changed", () => {
            console.log('=== PLACE_CHANGED EVENT FIRED ===');
            handlePlaceChanged();
        });

        console.log('Listener attached:', listenerRef.current);

        return () => {
            if (listenerRef.current) {
                google.maps.event.removeListener(listenerRef.current);
            }
        };
    }, [isLoaded, isInitialized, handlePlaceChanged]);

    // Sync value to input only when it changes and we're not in the middle of selecting
    useEffect(() => {
        if (inputRef.current && !isSelectingRef.current && inputRef.current.value !== value) {
            inputRef.current.value = value;
        }
    }, [value]);

    if (loadError) {
        return <Input placeholder="Error loading Google Maps" disabled />;
    }

    if (!isLoaded) {
        return <Input placeholder="Loading..." disabled />;
    }

    return (
        <Input
            ref={inputRef}
            defaultValue={value}
            onChange={(e) => {
                const newValue = e.target.value;
                if (onChangeRef.current) {
                    onChangeRef.current(newValue);
                }
            }}
            onKeyDown={(e) => {
                // When user presses Enter, trigger place selection
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // Small delay to let Google Places process the selection
                    setTimeout(() => {
                        handlePlaceChanged();
                    }, 100);
                }
            }}
            onBlur={(e) => {
                // On blur, check if we have a formatted address and trigger place selection
                const currentValue = e.target.value;
                if (currentValue && currentValue.includes(',')) {
                    // Looks like a formatted address, trigger place selection
                    setTimeout(() => {
                        handlePlaceChanged();
                    }, 100);
                }

                // Ensure the parent state has the current input value
                if (onChangeRef.current && currentValue) {
                    onChangeRef.current(currentValue);
                }
            }}
            placeholder={placeholder}
            className={className}
        />
    );
}
