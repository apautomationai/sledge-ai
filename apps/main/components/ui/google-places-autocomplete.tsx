"use client";

import React from "react";
import Autocomplete from "react-google-autocomplete";

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
    return (
        <Autocomplete
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            value={value}
            onChange={(e) => {
                const target = e.target as HTMLInputElement;
                onChange(target.value);
            }}
            onPlaceSelected={(place) => {
                if (!place || !place.address_components) {
                    return;
                }

                // Extract address components
                let streetNumber = "";
                let route = "";
                let city = "";
                let state = "";
                let postalCode = "";
                let country = "";

                place.address_components.forEach((component: any) => {
                    const types = component.types;

                    if (types.includes("street_number")) {
                        streetNumber = component.long_name;
                    }
                    if (types.includes("route")) {
                        route = component.long_name;
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

                const streetAddress = `${streetNumber} ${route}`.trim();
                const formattedAddress = place.formatted_address || streetAddress;
                const latitude = place.geometry?.location?.lat() || 0;
                const longitude = place.geometry?.location?.lng() || 0;

                // Update the input value
                onChange(formattedAddress);

                // Call onPlaceSelect callback with all extracted data
                if (onPlaceSelect) {
                    onPlaceSelect({
                        formattedAddress,
                        address: streetAddress || formattedAddress,
                        city,
                        state,
                        postalCode,
                        country,
                        latitude,
                        longitude,
                    });
                }
            }}
            options={{
                types: ["address"],
                fields: ["address_components", "formatted_address", "geometry"],
            }}
            placeholder={placeholder}
            className={`block w-full h-11 px-4 py-2 bg-white dark:bg-[#1b1b1b] rounded border border-gray-300 dark:border-[#808080] text-gray-900 dark:text-[#f6f6f6] text-sm font-medium focus:border-amber-400 focus:outline-none focus:ring-0 transition-colors placeholder-gray-400 ${className || ''}`}
        />
    );
}
