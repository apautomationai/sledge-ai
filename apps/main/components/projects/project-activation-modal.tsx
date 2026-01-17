import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { CalendarDays } from "lucide-react";
import { Project } from "@/lib/data/projects";

interface ProjectActivationModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onActivate: (projectId: number, data: {
        projectStartDate: string;
        billingCycleStartDate: string;
        billingCycleEndDate: string;
    }) => Promise<void>;
}

export function ProjectActivationModal({
    project,
    isOpen,
    onClose,
    onActivate
}: ProjectActivationModalProps) {
    const [projectStartDate, setProjectStartDate] = useState("");
    const [billingCycleStartDate, setBillingCycleStartDate] = useState("");
    const [billingCycleEndDate, setBillingCycleEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;

        setIsLoading(true);
        try {
            await onActivate(project.id, {
                projectStartDate,
                billingCycleStartDate,
                billingCycleEndDate
            });
            onClose();
            // Reset form
            setProjectStartDate("");
            setBillingCycleStartDate("");
            setBillingCycleEndDate("");
        } catch (error) {
            console.error("Failed to activate project:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = projectStartDate && billingCycleStartDate && billingCycleEndDate;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Activate Project Bill: {project?.name}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="projectStartDate">Project Bill Start Date</Label>
                        <Input
                            id="projectStartDate"
                            type="date"
                            value={projectStartDate}
                            onChange={(e) => setProjectStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-sm font-medium">Billing Cycle Period</Label>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="billingCycleStart" className="text-xs text-gray-600">
                                    Start Date
                                </Label>
                                <Input
                                    id="billingCycleStart"
                                    type="date"
                                    value={billingCycleStartDate}
                                    onChange={(e) => setBillingCycleStartDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="billingCycleEnd" className="text-xs text-gray-600">
                                    End Date
                                </Label>
                                <Input
                                    id="billingCycleEnd"
                                    type="date"
                                    value={billingCycleEndDate}
                                    onChange={(e) => setBillingCycleEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">
                            Select the billing cycle period (e.g., Dec 12 - Jan 18 or Dec 12 - Dec 30)
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isFormValid || isLoading}
                        >
                            {isLoading ? "Activating..." : "Activate Project Bill"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}