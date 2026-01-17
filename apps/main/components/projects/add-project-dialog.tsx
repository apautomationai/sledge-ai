import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Loader2 } from "lucide-react";

interface AddProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (project: { address: string; city: string; imageUrl: string }) => void;
}

export function AddProjectDialog({ open, onOpenChange, onAdd }: AddProjectDialogProps) {
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        onAdd({
            address,
            city,
            imageUrl: imageUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
        });

        // Reset form
        setAddress("");
        setCity("");
        setImageUrl("");
        setIsSubmitting(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Project Bill</DialogTitle>
                    <DialogDescription>
                        Enter the project bill details below. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="address">
                                Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="address"
                                placeholder="123 Main St"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="city">
                                City <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="city"
                                placeholder="New York, NY"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="imageUrl">Image URL (optional)</Label>
                            <Input
                                id="imageUrl"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty to use default image
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add Project Bill"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
