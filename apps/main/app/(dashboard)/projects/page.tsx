"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Plus, Search } from "lucide-react";
import {
    ProjectMap,
    ProjectList,
    Pagination,
    DeleteProjectDialog,
    type ProjectMapRef,
} from "@/components/projects";
import { type Project } from "@/lib/data/projects";
import client from "@/lib/axios-client";

const ITEMS_PER_PAGE = 10;

export default function ProjectsPage() {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProjects, setTotalProjects] = useState(0);
    const mapRef = useRef<ProjectMapRef>(null);
    const router = useRouter();

    // Fetch projects from API
    useEffect(() => {
        fetchProjects();
    }, [currentPage, searchQuery]);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const response:any = await client.get("/api/v1/projects", {
                params: {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    search: searchQuery,
                },
            });

            if (response.status === "success") {
                const fetchedProjects = response.data.projects.map((p: any) => ({
                    id: p.id,
                    address: p.address,
                    city: p.city || "",
                    coordinates: { lat: 0, lng: 0 }, // Will be geocoded if needed
                    imageUrl: p.imageUrl || "",
                }));

                setProjects(fetchedProjects);
                setVisibleProjects(fetchedProjects);
                setTotalPages(response.data.pagination.totalPages);
                setTotalProjects(response.data.pagination.total);

                // Fetch all projects for map (without pagination)
                if (currentPage === 1 && !searchQuery) {
                    setAllProjects(fetchedProjects);
                }
            }
        } catch (error: any) {
            toast.error("Failed to load projects");
            console.error("Error fetching projects:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleProjectSelect = (project: Project) => {
        setSelectedProjectId(project.id);
        mapRef.current?.panToProject(project.coordinates);
    };

    const handleMarkerClick = (projectId: number) => {
        setSelectedProjectId(projectId);
    };

    const handleProjectDelete = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const project = projects.find((p) => p.id === id);
        if (project) {
            setProjectToDelete(project);
            setShowDeleteDialog(true);
        }
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;

        setIsDeleting(true);
        try {
            const response:any = await client.delete(`/api/v1/projects/${projectToDelete.id}`);

            if (response.status === "success") {
                // Remove from local state
                setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
                setVisibleProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
                setAllProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));

                if (selectedProjectId === projectToDelete.id) {
                    setSelectedProjectId(null);
                }

                // Update total count
                setTotalProjects((prev) => prev - 1);

                toast.success("Project deleted successfully");

                // Refresh the list to get updated data
                fetchProjects();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete project");
            console.error("Error deleting project:", error);
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
            setProjectToDelete(null);
        }
    };

    const handleBoundsChange = (filteredProjects: Project[]) => {
        // For now, we'll keep the list synchronized with API pagination
        // Map bounds filtering can be added later if needed
    };



    return (
        <div className="h-[calc(100vh-6rem)] flex gap-4">
            {/* Left Side - Google Map */}
            <div className="w-1/2 rounded-lg border bg-card overflow-hidden">
                <ProjectMap
                    ref={mapRef}
                    projects={allProjects.length > 0 ? allProjects : projects}
                    onMarkerClick={handleMarkerClick}
                    onBoundsChange={handleBoundsChange}
                />
            </div>

            {/* Right Side - Project Cards */}
            <div className="w-1/2 flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
                        <p className="text-muted-foreground">
                            {totalProjects} project{totalProjects !== 1 ? "s" : ""} total
                        </p>
                    </div>
                    <Button onClick={() => router.push("/projects/new")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects by name, address, city..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-muted-foreground">Loading projects...</p>
                    </div>
                ) : (
                    <>
                        <ProjectList
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            onProjectSelect={handleProjectSelect}
                            onProjectDelete={handleProjectDelete}
                        />

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalProjects}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>

            {/* Delete Dialog */}
            <DeleteProjectDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={confirmDelete}
                projectAddress={projectToDelete?.address}
                isDeleting={isDeleting}
            />
        </div>
    );
}
