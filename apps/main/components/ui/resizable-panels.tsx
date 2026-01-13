"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@workspace/ui/lib/utils';

interface ResizablePanelsProps {
    children: [React.ReactNode, React.ReactNode];
    defaultLeftWidth?: number; // percentage (0-100)
    minLeftWidth?: number; // percentage
    maxLeftWidth?: number; // percentage
    minRightWidth?: number; // percentage
    minRightWidthPx?: number; // minimum right panel width in pixels
    className?: string;
    onResize?: (leftWidth: number) => void;
}

export function ResizablePanels({
    children,
    defaultLeftWidth = 50,
    minLeftWidth = 20,
    maxLeftWidth = 80,
    minRightWidth = 20,
    minRightWidthPx,
    className,
    onResize,
}: ResizablePanelsProps) {
    const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;

        // Calculate new left width as percentage
        let newLeftWidth = (mouseX / containerWidth) * 100;

        // Apply constraints: respect minLeftWidth, maxLeftWidth, and minRightWidth
        newLeftWidth = Math.max(newLeftWidth, minLeftWidth); // Ensure left panel isn't too small
        newLeftWidth = Math.min(newLeftWidth, maxLeftWidth); // Ensure left panel isn't too large
        newLeftWidth = Math.min(newLeftWidth, 100 - minRightWidth); // Ensure right panel isn't too small

        // Apply pixel-based minimum width constraint for right panel
        if (minRightWidthPx && containerWidth > 0) {
            const minRightWidthPercent = (minRightWidthPx / containerWidth) * 100;
            const maxLeftWidthFromPixels = 100 - minRightWidthPercent;
            newLeftWidth = Math.min(newLeftWidth, maxLeftWidthFromPixels);
        }

        setLeftWidth(newLeftWidth);
        onResize?.(newLeftWidth);
    }, [isDragging, minLeftWidth, maxLeftWidth, minRightWidth, minRightWidthPx, onResize]);

    // Handle window resize to recalculate pixel-based constraints
    useEffect(() => {
        const handleWindowResize = () => {
            if (!containerRef.current || !minRightWidthPx) return;

            const containerWidth = containerRef.current.getBoundingClientRect().width;
            if (containerWidth > 0) {
                const minRightWidthPercent = (minRightWidthPx / containerWidth) * 100;
                const maxLeftWidthFromPixels = 100 - minRightWidthPercent;

                // If current left width violates the pixel constraint, adjust it
                if (leftWidth > maxLeftWidthFromPixels) {
                    const newLeftWidth = Math.max(maxLeftWidthFromPixels, minLeftWidth);
                    setLeftWidth(newLeftWidth);
                    onResize?.(newLeftWidth);
                }
            }
        };

        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    }, [leftWidth, minLeftWidth, minRightWidthPx, onResize]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const rightWidth = 100 - leftWidth;

    return (
        <div
            ref={containerRef}
            className={cn("flex h-full w-full", className)}
        >
            {/* Left Panel */}
            <div
                className="flex flex-col min-w-0 overflow-hidden"
                style={{ width: `${leftWidth}%` }}
            >
                {children[0]}
            </div>

            {/* Resizer */}
            <div
                className={cn(
                    "relative flex items-center justify-center w-1 bg-border hover:bg-primary/20 cursor-col-resize transition-colors group",
                    isDragging && "bg-primary/30"
                )}
                onMouseDown={handleMouseDown}
                title="Drag to resize panels"
            >
                {/* Drag handle - visible on hover */}
                <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
                    <div className="w-1 h-8 bg-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Drag dots indicator */}
                <div className="absolute flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-0.5 h-0.5 bg-muted-foreground rounded-full" />
                    <div className="w-0.5 h-0.5 bg-muted-foreground rounded-full" />
                    <div className="w-0.5 h-0.5 bg-muted-foreground rounded-full" />
                </div>
            </div>

            {/* Right Panel */}
            <div
                className="flex flex-col min-w-0 overflow-hidden"
                style={{ width: `${rightWidth}%` }}
            >
                {children[1]}
            </div>
        </div>
    );
}