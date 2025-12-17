import React from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { ProjectCard } from "./project-card";
import { Project } from "@/lib/data/projects";

interface ProjectListProps {
    projects: Project[];
    onProjectDelete: (id: number, e: React.MouseEvent) => void;
    onProjectActivate?: (project: Project) => void;
}

export function ProjectList({
    projects,
    onProjectDelete,
    onProjectActivate,
}: ProjectListProps) {
    return (
        <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onDelete={(e) => onProjectDelete(project.id, e)}
                        onActivate={onProjectActivate}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}
