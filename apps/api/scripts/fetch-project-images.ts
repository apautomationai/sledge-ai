/**
 * Script to fetch high-quality images for projects using Google Maps Places API
 * Updates project.imageUrl with the best available photo
 */

import db from '../lib/db';
import { projectsModel } from '../models/projects.model';
import { eq } from 'drizzle-orm';
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

async function findPlaceByAddress(address: string): Promise<PlaceResult | null> {
    try {
        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
            {
                params: {
                    input: address,
                    inputtype: 'textquery',
                    fields: 'place_id,name,photos',
                    key: GOOGLE_MAPS_API_KEY,
                }
            }
        );

        if (response.data.status === 'OK' && response.data.candidates?.length > 0) {
            return response.data.candidates[0];
        }

        return null;
    } catch (error: any) {
        console.error(`   ❌ Error finding place: ${error.message}`);
        return null;
    }
}

async function getPlaceDetails(placeId: string): Promise<PlacePhoto[] | null> {
    try {
        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
                params: {
                    place_id: placeId,
                    fields: 'photos',
                    key: GOOGLE_MAPS_API_KEY,
                }
            }
        );

        if (response.data.status === 'OK' && response.data.result?.photos) {
            return response.data.result.photos;
        }

        return null;
    } catch (error: any) {
        console.error(`   ❌ Error getting place details: ${error.message}`);
        return null;
    }
}

function getPhotoUrl(photoReference: string, maxWidth: number = 1200): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
}

async function fetchProjectImages() {
    console.log('\n🖼️  Starting project image fetch...\n');

    if (!GOOGLE_MAPS_API_KEY) {
        console.error('❌ GOOGLE_MAPS_API_KEY not found in environment variables');
        console.error('Please set GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY');
        process.exit(1);
    }

    try {
        // Fetch all projects
        console.log('📊 Fetching all projects...');
        const projects = await db
            .select()
            .from(projectsModel);

        console.log(`✅ Found ${projects.length} projects\n`);

        if (projects.length === 0) {
            console.log('⚠️ No projects found. Exiting...');
            return;
        }

        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const project of projects) {
            console.log(`\n🔍 Processing: ${project.name}`);
            console.log(`   Address: ${project.address}`);

            try {
                // Find place by address
                const place = await findPlaceByAddress(project.address);

                if (!place) {
                    console.log(`   ⚠️ No place found for this address`);

                    // Set imageUrl to null if no place found
                    await db
                        .update(projectsModel)
                        .set({ imageUrl: null })
                        .where(eq(projectsModel.id, project.id));

                    skippedCount++;
                    continue;
                }

                console.log(`   ✅ Found place: ${place.name}`);

                // Get photos
                let photos = place.photos;

                // If no photos in initial response, try getting place details
                if (!photos || photos.length === 0) {
                    console.log(`   🔍 Fetching place details for more photos...`);
                    photos = (await getPlaceDetails(place.place_id)) ?? undefined;
                }

                if (!photos || photos.length === 0) {
                    console.log(`   ⚠️ No photos available for this place`);

                    // Set imageUrl to null if no photos
                    await db
                        .update(projectsModel)
                        .set({ imageUrl: null })
                        .where(eq(projectsModel.id, project.id));

                    skippedCount++;
                    continue;
                }

                // Get the best quality photo (first one is usually the best)
                const bestPhoto = photos[0];
                const photoUrl = getPhotoUrl(bestPhoto.photo_reference, 1200);

                console.log(`   📸 Found ${photos.length} photo(s)`);
                console.log(`   🖼️  Using photo: ${bestPhoto.width}x${bestPhoto.height}`);

                // Update project with photo URL
                await db
                    .update(projectsModel)
                    .set({ imageUrl: photoUrl })
                    .where(eq(projectsModel.id, project.id));

                console.log(`   ✅ Updated project image`);
                updatedCount++;

                // Add delay to avoid hitting API rate limits
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error: any) {
                console.error(`   ❌ Error processing project: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`   ✅ Projects updated with images: ${updatedCount}`);
        console.log(`   ⚠️ Projects without images (set to null): ${skippedCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📍 Total projects: ${projects.length}`);

    } catch (error: any) {
        console.error('\n❌ Script failed:', error);
        throw error;
    }
}

// Run the script
fetchProjectImages()
    .then(() => {
        console.log('\n✅ Image fetch complete!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Image fetch failed:', error);
        process.exit(1);
    });
