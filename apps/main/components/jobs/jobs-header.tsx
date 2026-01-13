import React from "react";

export function JobsHeader() {
    return (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bill Queue</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                All bills pulled in from email and uploads. Pick a mission to review
            </p>
        </div>
    );
}
