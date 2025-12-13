"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Plus, Search, ArrowUpAZ, ArrowDownZA, Type } from "lucide-react";
import {
    ProjectMap,
    ProjectList,
    Pagination,
    DeleteProjectDialog,
    type ProjectMapRef,
} from "@/components/projects";
import { type Project, type ProjectWithCoordinates } from "@/lib/data/projects";
import client from "@/lib/axios-client";

const ITEMS_PER_PAGE = 10;

// Custom hook for debounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

type SortOrder = 'asc' | 'desc' | null;

export default function ProjectsPage() {
    const [allProjects, setAllProjects] = useState<ProjectWithCoordinates[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProjects, setTotalProjects] = useState(0);
    const mapRef = useRef<ProjectMapRef>(null);
    const router = useRouter();

    // Debounce search input
    const debouncedSearchQuery = useDebounce(searchInput, 500);

    // Fetch projects from API
    useEffect(() => {
        fetchProjects();
        fetchMapProjects();
    }, [currentPage, debouncedSearchQuery, sortOrder]);

    // Reset to first page when search changes
    useEffect(() => {
        if (debouncedSearchQuery !== searchInput) return; // Only reset when debounced value changes
        setCurrentPage(1);
    }, [debouncedSearchQuery]);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const response = await client.get("/api/v1/projects", {
                params: {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    search: debouncedSearchQuery,
                    sortBy: sortOrder ? "name" : "createdAt",
                    sortOrder: sortOrder || "desc",
                },
            });

            if (response.status === "success") {
                const fetchedProjects: Project[] = response.data.projects.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    address: p.address,
                    city: p.city || "",
                    state: p.state || "",
                    imageUrl: p.imageUrl || "",
                    latitude: p.latitude,
                    longitude: p.longitude,
                    vendorCount: p.vendorCount,
                }));

                setProjects(fetchedProjects);
                setTotalPages(response.data.pagination.totalPages);
                setTotalProjects(response.data.pagination.total);
            }
        } catch (error: any) {
            toast.error("Failed to load projects");
            console.error("Error fetching projects:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMapProjects = async () => {
        try {
            const response = await client.get("/api/v1/projects/map");

            if (response.status === "success") {
                const mapProjects: ProjectWithCoordinates[] = response.data
                    .filter((p: any) => p.latitude && p.longitude) // Only projects with coordinates
                    .map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        address: p.address,
                        city: p.city || "",
                        state: p.state || "",
                        imageUrl: p.imageUrl || "",
                        latitude: p.latitude,
                        longitude: p.longitude,
                        coordinates: {
                            lat: parseFloat(p.latitude),
                            lng: parseFloat(p.longitude),
                        },
                    }));

                setAllProjects(mapProjects);
            }
        } catch (error: any) {
            console.error("Error fetching map projects:", error);
        }
    };

    const handleSearch = (value: string) => {
        setSearchInput(value);
    };

    const handleSort = () => {
        if (sortOrder === null) {
            setSortOrder('asc');
        } else if (sortOrder === 'asc') {
            setSortOrder('desc');
        } else {
            setSortOrder(null);
        }
        setCurrentPage(1); // Reset to first page on sort change
    };

    const getSortIcon = () => {
        if (sortOrder === 'asc') return <ArrowUpAZ className="h-4 w-4" />;
        if (sortOrder === 'desc') return <ArrowDownZA className="h-4 w-4" />;
        return <Type className="h-4 w-4" />;
    };

    const handleProjectSelect = (project: Project) => {
        setSelectedProjectId(project.id);

        // Find the project in allProjects to get coordinates
        const projectWithCoords = allProjects.find(p => p.id === project.id);
        if (projectWithCoords) {
            mapRef.current?.panToProject(projectWithCoords.coordinates);
        }
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
            const response = await client.delete(`/api/v1/projects/${projectToDelete.id}`);

            if (response.status === "success") {
                // Remove from local state
                setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
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

    const handleBoundsChange = (filteredProjects: ProjectWithCoordinates[]) => {
        // For now, we'll keep the list synchronized with API pagination
        // Map bounds filtering can be added later if needed
    };



    return (
        <div className="h-[calc(100vh-6rem)] flex gap-4">
            {/* Left Side - Google Map */}
            <div className="w-1/2 rounded-lg border bg-card overflow-hidden">
                <ProjectMap
                    ref={mapRef}
                    projects={allProjects}
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

                {/* Search Bar and Sort */}
                <div className="mb-4 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects by name, address, city..."
                            value={searchInput}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSort}
                        title={`Sort projects ${sortOrder === 'asc' ? 'A-Z' : sortOrder === 'desc' ? 'Z-A' : 'by date (click for A-Z)'}`}
                    >
                        {getSortIcon()}
                    </Button>
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
