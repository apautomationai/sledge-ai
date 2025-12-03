import React from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { ProjectCard } from "./project-card";

interface Project {
    id: number;
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
    imageUrl: string;
}

interface ProjectListProps {
    projects: Project[];
    selectedProjectId: number | null;
    onProjectSelect: (project: Project) => void;
    onProjectDelete: (id: number, e: React.MouseEvent) => void;
}

export function ProjectList({
    projects,
    selectedProjectId,
    onProjectSelect,
    onProjectDelete,
}: ProjectListProps) {
    return (
        <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        isSelected={selectedProjectId === project.id}
                        onSelect={() => onProjectSelect(project)}
                        onDelete={(e) => onProjectDelete(project.id, e)}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}
