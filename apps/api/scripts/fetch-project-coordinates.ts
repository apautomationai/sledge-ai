import db from "@/lib/db";
import { projectsModel } from "@/models/projects.model";
import { googleMapsService } from "@/services/google-maps.service";
import { eq, isNull, or } from "drizzle-orm";

async function fetchProjectCoordinates() {
    console.log("🗺️ Fetching coordinates for projects without latitude/longitude...");

    try {
        // Get all projects that don't have coordinates
        const projectsWithoutCoordinates = await db
            .select({
                id: projectsModel.id,
                name: projectsModel.name,
                address: projectsModel.address,
                city: projectsModel.city,
                state: projectsModel.state,
                postalCode: projectsModel.postalCode,
                latitude: projectsModel.latitude,
                longitude: projectsModel.longitude,
            })
            .from(projectsModel)
            .where(
                or(
                    isNull(projectsModel.latitude),
                    isNull(projectsModel.longitude)
                )
            );

        console.log(`📊 Found ${projectsWithoutCoordinates.length} projects without coordinates`);

        if (projectsWithoutCoordinates.length === 0) {
            console.log("✅ All projects already have coordinates!");
            return;
        }

        let successCount = 0;
        let failureCount = 0;

        for (const project of projectsWithoutCoordinates) {
            console.log(`\n🏗️ Processing: ${project.name}`);
            console.log(`   Address: ${project.address}`);

            try {
                // Build full address
                const fullAddress = `${project.address}, ${project.city}, ${project.state} ${project.postalCode}`.trim();

                // Geocode the address
                const geocodeResult = await googleMapsService.geocodeAddress(fullAddress);

                if (geocodeResult) {
                    // Update the project with coordinates
                    await db
                        .update(projectsModel)
                        .set({
                            latitude: geocodeResult.latitude.toString(),
                            longitude: geocodeResult.longitude.toString(),
                            updatedAt: new Date()
                        })
                        .where(eq(projectsModel.id, project.id));

                    console.log(`   ✅ Updated coordinates: ${geocodeResult.latitude}, ${geocodeResult.longitude}`);
                    successCount++;
                } else {
                    console.log(`   ❌ No coordinates found for this address`);
                    failureCount++;
                }

                // Add a small delay to avoid hitting API rate limits
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
                console.error(`   ❌ Error processing project ${project.id}:`, error);
                failureCount++;
            }
        }

        console.log(`\n📈 Summary:`);
        console.log(`   ✅ Successfully updated: ${successCount} projects`);
        console.log(`   ❌ Failed to update: ${failureCount} projects`);
        console.log(`   📊 Total processed: ${projectsWithoutCoordinates.length} projects`);

    } catch (error) {
        console.error("❌ Script error:", error);
    }
}

// Run the script
fetchProjectCoordinates()
    .then(() => {
        console.log("\n🎉 Script completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Script failed:", error);
        process.exit(1);
    });