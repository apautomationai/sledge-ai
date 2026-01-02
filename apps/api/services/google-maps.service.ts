import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface PlacePhoto {
    photo_reference: string;
    height: number;
    width: number;
}

interface PlaceResult {
    place_id: string;
    name: string;
    photos?: PlacePhoto[];
}

interface GeocodeResult {
    latitude: number;
    longitude: number;
    formatted_address: string;
}

class GoogleMapsService {
    private isApiKeyAvailable(): boolean {
        const hasKey = !!GOOGLE_MAPS_API_KEY;
        if (!hasKey) {
            console.log('Google Maps API key not found in environment variables');
        }
        return hasKey;
    }

    async findPlaceByAddress(address: string): Promise<PlaceResult | null> {
        if (!this.isApiKeyAvailable()) {
            return null;
        }

        try {
            const response = await axios.get(
                'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
                {
                    params: {
                        input: address,
                        inputtype: 'textquery',
                        fields: 'place_id,name,photos',
                        key: GOOGLE_MAPS_API_KEY,
                    },
                    timeout: 5000 // 5 second timeout
                }
            );

            if (response.data.status === 'OK' && response.data.candidates?.length > 0) {
                return response.data.candidates[0];
            }

            return null;
        } catch (error: any) {
            console.error(`Error finding place for address "${address}":`, error.message);
            return null;
        }
    }

    async getPlaceDetails(placeId: string): Promise<PlacePhoto[] | null> {
        if (!this.isApiKeyAvailable()) {
            return null;
        }

        try {
            const response = await axios.get(
                'https://maps.googleapis.com/maps/api/place/details/json',
                {
                    params: {
                        place_id: placeId,
                        fields: 'photos',
                        key: GOOGLE_MAPS_API_KEY,
                    },
                    timeout: 5000 // 5 second timeout
                }
            );

            if (response.data.status === 'OK' && response.data.result?.photos) {
                return response.data.result.photos;
            }

            return null;
        } catch (error: any) {
            console.error(`Error getting place details for place ID "${placeId}":`, error.message);
            return null;
        }
    }

    getPhotoUrl(photoReference: string, maxWidth: number = 1200): string {
        if (!this.isApiKeyAvailable()) {
            return '';
        }

        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
    }

    async getImageUrlForAddress(address: string): Promise<string | null> {
        if (!this.isApiKeyAvailable()) {
            return null;
        }

        // Add overall timeout for the entire operation
        const timeoutPromise = new Promise<null>((_, reject) => {
            setTimeout(() => reject(new Error('Google Maps API timeout')), 10000); // 10 second total timeout
        });

        try {
            return await Promise.race([
                this.getImageUrlForAddressInternal(address),
                timeoutPromise
            ]);
        } catch (error: any) {
            console.error(`Error getting image for address "${address}":`, error.message);
            return null;
        }
    }

    private async getImageUrlForAddressInternal(address: string): Promise<string | null> {
        try {
            // Find place by address
            const place = await this.findPlaceByAddress(address);

            if (!place) {
                return null;
            }

            // Get photos
            let photos = place.photos;

            // If no photos in initial response, try getting place details
            if (!photos || photos.length === 0) {
                const placePhotos = await this.getPlaceDetails(place.place_id);
                photos = placePhotos || undefined;
            }

            if (!photos || photos.length === 0) {
                return null;
            }

            // Get the best quality photo (first one is usually the best)
            const bestPhoto = photos[0];
            return this.getPhotoUrl(bestPhoto.photo_reference, 1200);

        } catch (error: any) {
            throw error; // Re-throw to be caught by the outer try-catch
        }
    }

    async geocodeAddress(address: string): Promise<GeocodeResult | null> {
        if (!this.isApiKeyAvailable()) {
            return null;
        }

        try {
            const response = await axios.get(
                'https://maps.googleapis.com/maps/api/geocode/json',
                {
                    params: {
                        address: address,
                        key: GOOGLE_MAPS_API_KEY,
                    },
                    timeout: 5000 // 5 second timeout
                }
            );

            if (response.data.status === 'OK' && response.data.results?.length > 0) {
                const result = response.data.results[0];
                const location = result.geometry.location;

                return {
                    latitude: location.lat,
                    longitude: location.lng,
                    formatted_address: result.formatted_address
                };
            }

            return null;
        } catch (error: any) {
            console.error(`Error geocoding address "${address}":`, error.message);
            return null;
        }
    }
}

export const googleMapsService = new GoogleMapsService();