export interface Project {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    imageUrl: string;
    latitude: string | null;
    longitude: string | null;
    status?: string;
    projectStartDate?: string;
    billingCycleStartDate?: string;
    billingCycleEndDate?: string;
    vendorCount?: number;
}

export interface ProjectWithCoordinates extends Project {
    coordinates: { lat: number; lng: number };
}
