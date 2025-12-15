/**
 * Script to fetch project images using free services (no API key required)
 * Uses Unsplash Source API for random construction/building images
 * Or generates placeholder images with address text
 */

import db from '../lib/db';
import { projectsModel } from '../models/projects.model';
import { eq } from 'drizzle-orm';

// Free image sources (no API key required)
const FREE_IMAGE_SOURCES = [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80', // Construction site
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80', // Building exterior
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80', // Construction work
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80', // Modern building
    'https://images.unsplash.com/photo-1590496793907-4d0b8e5d0d2e?w=1200&q=80', // Construction equipment
    'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=1200&q=80', // Building construction
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80', // Construction site aerial
    'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200&q=80', // Building facade
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80', // Construction workers
    'https://images.unsplash.com/photo-1597476374736-e0d7e5c53c7f?w=1200&q=80', // Building under construction
];

export function getRandomImage(): string {
    const randomIndex = Math.floor(Math.random() * FREE_IMAGE_SOURCES.length);
    return FREE_IMAGE_SOURCES[randomIndex];
}

function generatePlaceholderUrl(address: string, index: number): string {
    // Use a deterministic approach based on address length and index
    const hash = (address.length + index) % FREE_IMAGE_SOURCES.length;
    return FREE_IMAGE_SOURCES[hash];
}

async function fetchProjectImages() {
    console.log('\n🖼️  Starting project image fetch (Free Mode)...\n');
    console.log('ℹ️  Using free Unsplash images for development purposes\n');

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
        let errorCount = 0;

        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            console.log(`\n🔍 Processing [${i + 1}/${projects.length}]: ${project.name}`);

            try {
                // Generate a consistent image URL based on the address
                const imageUrl = generatePlaceholderUrl(project.address, i);

                console.log(`   🖼️  Assigning image: ${imageUrl.substring(0, 60)}...`);

                // Update project with image URL
                await db
                    .update(projectsModel)
                    .set({ imageUrl })
                    .where(eq(projectsModel.id, project.id));

                console.log(`   ✅ Updated project image`);
                updatedCount++;

            } catch (error: any) {
                console.error(`   ❌ Error processing project: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`   ✅ Projects updated with images: ${updatedCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📍 Total projects: ${projects.length}`);
        console.log('\nℹ️  Note: Using free Unsplash construction/building images');
        console.log('   For production, use the Google Maps API version with real location photos');

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
