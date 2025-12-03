"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import {
    ProjectMap,
    ProjectList,
    Pagination,
    DeleteProjectDialog,
    type ProjectMapRef,
} from "@/components/projects";
import { PLACEHOLDER_PROJECTS, type Project } from "@/lib/data/projects";
import { usePagination } from "../../../hooks/use-pagination";

const ITEMS_PER_PAGE = 10;

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>(PLACEHOLDER_PROJECTS);
    const [visibleProjects, setVisibleProjects] = useState<Project[]>(PLACEHOLDER_PROJECTS);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const mapRef = useRef<ProjectMapRef>(null);
    const router = useRouter();

    const {
        currentPage,
        totalPages,
        paginatedItems: currentProjects,
        setPage,
    } = usePagination(visibleProjects, ITEMS_PER_PAGE);

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
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
        setVisibleProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
        if (selectedProjectId === projectToDelete.id) {
            setSelectedProjectId(null);
        }

        toast.success("Project deleted successfully");
        setIsDeleting(false);
        setShowDeleteDialog(false);
        setProjectToDelete(null);
    };

    const handleBoundsChange = (filteredProjects: Project[]) => {
        setVisibleProjects(filteredProjects);
        setPage(1); // Reset to first page when bounds change
    };



    return (
        <div className="h-[calc(100vh-6rem)] flex gap-4">
            {/* Left Side - Google Map */}
            <div className="w-1/2 rounded-lg border bg-card overflow-hidden">
                <ProjectMap
                    ref={mapRef}
                    projects={projects}
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
                            {visibleProjects.length} of {projects.length} project{projects.length !== 1 ? "s" : ""} in view
                        </p>
                    </div>
                    <Button onClick={() => router.push("/projects/new")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                    </Button>
                </div>

                <ProjectList
                    projects={currentProjects}
                    selectedProjectId={selectedProjectId}
                    onProjectSelect={handleProjectSelect}
                    onProjectDelete={handleProjectDelete}
                />

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={visibleProjects.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setPage}
                />
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
