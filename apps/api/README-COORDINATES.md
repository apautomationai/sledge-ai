# Project Coordinates Feature

## Overview
Projects now automatically fetch and store latitude/longitude coordinates for map display.

## Setup
1. Add Google Maps API key to your environment:
   ```bash
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

2. Enable the following APIs in Google Cloud Console:
   - Geocoding API
   - Places API (for images)

## Usage

### API Endpoints
- `GET /api/projects` - Returns projects with coordinates
- `GET /api/projects/map` - Optimized endpoint for map display (only projects with coordinates)

### Populate Coordinates for Existing Projects
```bash
cd apps/api
npx tsx scripts/fetch-project-coordinates.ts
```

## How It Works
- Coordinates are fetched automatically in the background when projects are accessed
- Uses Google Maps Geocoding API to convert addresses to lat/lng
- Coordinates are cached in the database to avoid repeated API calls
- Projects without coordinates are still returned but with null values

## Frontend Integration
The map component automatically displays markers for projects with coordinates. Projects without coordinates will be geocoded in the background and appear on subsequent page loads.