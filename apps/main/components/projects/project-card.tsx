import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Trash2, MapPin } from "lucide-react";
import { Project } from "@/lib/data/projects";

interface ProjectCardProps {
    project: Project;
    onDelete: (e: React.MouseEvent) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/projects/${project.id}`);
    };

    return (
        <Card
            className="cursor-pointer transition-all hover:shadow-lg overflow-hidden group relative"
            onClick={handleClick}
        >
            {/* Background Image */}
            <div
                className="h-48 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${project.imageUrl})` }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Delete Button */}
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={onDelete}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>

                {/* Project Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-lg leading-tight">
                                {project.name}
                            </p>
                            <p className="text-sm text-gray-200">
                                {project.city}, {project.state}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
