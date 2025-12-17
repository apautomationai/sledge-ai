import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@workspace/ui/components/card";

import { MapPin } from "lucide-react";
import { Project } from "@/lib/data/projects";

interface ProjectPopupProps {
    project: Project;
    position: { x: number; y: number };
    onClose: () => void;
    onActivate?: (project: Project) => void;
}

export function ProjectPopup({ project, position, onClose, onActivate }: ProjectPopupProps) {
    const router = useRouter();

    const handleClick = () => {
        if (project.status === 'pending' && onActivate) {
            onActivate(project);
        } else {
            router.push(`/projects/${project.id}`);
        }
        onClose();
    };



    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Calculate popup position relative to marker with edge detection
    const popupWidth = 320; // w-80 = 20rem = 320px
    const popupHeight = 300; // Approximate height
    const margin = 16; // Margin from screen edges

    let left = position.x;
    let top = position.y - popupHeight - 10; // Position above marker with 10px gap
    let transform = 'translate(-50%, 0)'; // Center horizontally by default

    // Adjust horizontal position if popup would go off-screen
    if (left - popupWidth / 2 < margin) {
        // Too far left, align to left edge
        left = margin + popupWidth / 2;
    } else if (left + popupWidth / 2 > window.innerWidth - margin) {
        // Too far right, align to right edge
        left = window.innerWidth - margin - popupWidth / 2;
    }

    // Adjust vertical position if popup would go off-screen
    if (top < margin) {
        // Not enough space above, position below marker
        top = position.y + 10;
    }

    const popupStyle = {
        position: 'fixed' as const,
        left: `${left}px`,
        top: `${top}px`,
        transform,
        zIndex: 1000,
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <>
            {/* Invisible backdrop for click-outside-to-close */}
            <div
                className="fixed inset-0 z-40"
                onClick={handleBackdropClick}
            />

            <Card
                className="w-80 overflow-hidden relative shadow-2xl cursor-pointer"
                style={popupStyle}
                onClick={handleClick}
            >
                {/* Arrow pointing to marker (only show if popup is above marker) */}
                {top < position.y && (
                    <div
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-200"
                        style={{ zIndex: -1 }}
                    />
                )}

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
        </>
    );
}