import React from "react";
import { LienWaiverTableRow } from "./lien-waiver-table-row";

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

interface LienWaiverTableProps {
    lienWaivers: LienWaiver[];
    isLoading: boolean;
}

const statusColors: Record<string, string> = {
    Requested: "text-yellow-500",
    "Pending Signature": "text-orange-500",
    Completed: "text-green-500",
};

export function LienWaiverTable({ lienWaivers, isLoading }: LienWaiverTableProps) {
    return (
        <div className="rounded-lg border bg-card h-full overflow-auto">
            <table className="w-full">
                <thead className="border-b bg-card sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Lien Waiver
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Vendor
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Date
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={4} className="text-center py-12 text-muted-foreground">
                                Loading lien waivers...
                            </td>
                        </tr>
                    ) : lienWaivers.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center py-12 text-muted-foreground">
                                No lien waivers found
                            </td>
                        </tr>
                    ) : (
                        lienWaivers.map((lw) => (
                            <LienWaiverTableRow
                                key={lw.id}
                                lienWaiver={lw}
                                statusColors={statusColors}
                            />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
