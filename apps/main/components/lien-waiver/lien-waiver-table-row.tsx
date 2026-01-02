"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";

interface LienWaiver {
    id: number;
    lienWaiverNumber: string;
    type: "Conditional" | "Unconditional";
    typeDescription: string;
    throughDate: string;
    vendorName: string;
    vendorSubtitle?: string;
    vendorInitial: string;
    status: "Requested" | "Pending Signature" | "Completed";
    sentDate?: string;
    pendingSince?: string;
}

interface LienWaiverTableRowProps {
    lienWaiver: LienWaiver;
    statusColors: Record<string, string>;
}

export function LienWaiverTableRow({ lienWaiver: lw, statusColors }: LienWaiverTableRowProps) {
    const router = useRouter();

    const handleRowClick = () => {
        router.push(`/lien-waiver/${lw.id}`);
    };

    return (
        <tr
            className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
            onClick={handleRowClick}
        >
            {/* Lien Waiver Column */}
            <td className="py-4 px-4">
                <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                        {lw.lienWaiverNumber}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-500 rounded">
                            {lw.type}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {lw.typeDescription}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Thru {format(new Date(lw.throughDate), "MMM d, yyyy")}
                    </p>
                </div>
            </td>

            {/* Vendor Column */}
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                        {lw.vendorInitial}
                    </div>
                    <div>
                        <p className="font-medium text-foreground">
                            {lw.vendorName}
                        </p>
                        {lw.vendorSubtitle && (
                            <p className="text-sm text-muted-foreground">
                                {lw.vendorSubtitle}
                            </p>
                        )}
                    </div>
                </div>
            </td>

            {/* Status Column */}
            <td className="py-4 px-4">
                <span className={cn("font-medium", statusColors[lw.status])}>
                    {lw.status}
                </span>
            </td>

            {/* Date Column */}
            <td className="py-4 px-4">
                <div className="text-sm">
                    {lw.status === "Pending Signature" ? (
                        <>
                            <p className="text-muted-foreground">Pending</p>
                            <p className="text-muted-foreground">
                                since {lw.pendingSince && format(new Date(lw.pendingSince), "MMM d, yyyy")}
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-foreground">Sent</p>
                            <p className="text-muted-foreground">
                                {lw.sentDate && format(new Date(lw.sentDate), "MMM d, yyyy")}
                            </p>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}
