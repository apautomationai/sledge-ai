// Placeholder project data
export const PLACEHOLDER_PROJECTS = [
    {
        id: 1,
        address: "123 Main St",
        city: "New York, NY",
        coordinates: { lat: 40.7128, lng: -74.0060 },
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    },
    {
        id: 2,
        address: "456 River Rd",
        city: "Brooklyn, NY",
        coordinates: { lat: 40.6782, lng: -73.9442 },
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    },
    {
        id: 3,
        address: "789 Innovation Dr",
        city: "San Francisco, CA",
        coordinates: { lat: 37.7749, lng: -122.4194 },
        imageUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80",
    },
    {
        id: 4,
        address: "321 Shopping Blvd",
        city: "Los Angeles, CA",
        coordinates: { lat: 34.0522, lng: -118.2437 },
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    },
    {
        id: 5,
        address: "555 Health Ave",
        city: "Chicago, IL",
        coordinates: { lat: 41.8781, lng: -87.6298 },
        imageUrl: "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800&q=80",
    },
    {
        id: 6,
        address: "888 Tech Park",
        city: "Austin, TX",
        coordinates: { lat: 30.2672, lng: -97.7431 },
        imageUrl: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&q=80",
    },
];

export type Project = typeof PLACEHOLDER_PROJECTS[0];
