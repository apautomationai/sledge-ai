"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@workspace/ui/lib/utils';

interface ResizablePanelsProps {
    children: [React.ReactNode, React.ReactNode];
    defaultLeftWidth?: number; // percentage (0-100)
    minLeftWidth?: number; // percentage
    maxLeftWidth?: number; // percentage
    className?: string;
    onResize?: (leftWidth: number) => void;
}

export function ResizablePanels({
    children,
    defaultLeftWidth = 50,
    minLeftWidth = 20,
    maxLeftWidth = 80,
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
        const newLeftWidth = Math.min(
            Math.max((mouseX / containerWidth) * 100, minLeftWidth),
            maxLeftWidth
        );

        setLeftWidth(newLeftWidth);
        onResize?.(newLeftWidth);
    }, [isDragging, minLeftWidth, maxLeftWidth, onResize]);

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