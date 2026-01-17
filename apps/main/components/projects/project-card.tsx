import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Trash2, MapPin } from "lucide-react";
import { Project } from "@/lib/data/projects";

interface ProjectCardProps {
    project: Project;
    onDelete: (e: React.MouseEvent) => void;
    onActivate?: (project: Project) => void;
}

export function ProjectCard({ project, onDelete, onActivate }: ProjectCardProps) {
    const router = useRouter();

    const handleClick = () => {
        if (project.status === 'pending' && onActivate) {
            onActivate(project);
        } else {
            router.push(`/project-bills/${project.id}`);
        }
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

                {/* Status Badge */}
                {project.status !== 'active' && (
                    <div className="absolute top-2 left-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${project.status === 'pending' ? 'bg-red-100 text-red-800' :
                            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                                    project.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-red-100 text-red-800'
                            }`}>
                            {project.status === 'pending' ? 'ACTION NEEDED' :
                                project.status?.replace('_', ' ').toUpperCase() || 'ACTION NEEDED'}
                        </span>
                    </div>
                )}

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
