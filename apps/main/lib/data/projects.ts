export interface Project {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    imageUrl: string;
    latitude: string | null;
    longitude: string | null;
    vendorCount?: number;
}

export interface ProjectWithCoordinates extends Project {
    coordinates: { lat: number; lng: number };
}
