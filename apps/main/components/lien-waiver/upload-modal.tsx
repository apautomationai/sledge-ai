"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, AlertCircle, X, File, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";

interface UploadModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onUpload: (file: File) => Promise<void>;
    title?: string;
    description?: string;
    acceptedFileTypes?: string;
    maxFileSizeMB?: number;
}

export function UploadModal({
    isOpen,
    onOpenChange,
    onUpload,
    title = "Upload Signed Lien Waiver",
    description = "Upload your signed lien waiver document. Only PDF files up to 10MB are accepted.",
    acceptedFileTypes = ".pdf,application/pdf",
    maxFileSizeMB = 10,
}: UploadModalProps) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        const acceptedTypes = acceptedFileTypes.split(",").map((t) => t.trim());
        const isValidType = acceptedTypes.some((type) => {
            if (type.startsWith(".")) {
                return file.name.toLowerCase().endsWith(type);
            }
            return file.type === type;
        });

        if (!isValidType) {
            return `Please upload a valid file (${acceptedFileTypes})`;
        }
        if (file.size > maxFileSizeMB * 1024 * 1024) {
            return `File size must be less than ${maxFileSizeMB}MB`;
        }
        return null;
    };

    const handleFileSelect = (file: File) => {
        const error = validateFile(file);
        if (error) {
            setUploadError(error);
            setUploadedFile(null);
            return;
        }
        setUploadError(null);
        setUploadedFile(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleUploadSubmit = async () => {
        if (!uploadedFile) {
            setUploadError("Please select a file to upload");
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            await onUpload(uploadedFile);
            resetModal();
            onOpenChange(false);
        } catch (error) {
            console.error("Upload error:", error);
            setUploadError("Failed to upload. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const resetModal = () => {
        setUploadedFile(null);
        setUploadError(null);
        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
        if (!open) resetModal();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-white">{title}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                            isDragging
                                ? "border-yellow-500 bg-yellow-500/10"
                                : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                        )}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={acceptedFileTypes}
                            onChange={handleFileInputChange}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center",
                                isDragging ? "bg-yellow-500/20" : "bg-gray-700"
                            )}>
                                <Upload className={cn(
                                    "w-6 h-6",
                                    isDragging ? "text-yellow-500" : "text-gray-400"
                                )} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-300">
                                    <span className="text-yellow-500 font-medium">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">PDF only (max {maxFileSizeMB}MB)</p>
                            </div>
                        </div>
                    </div>

                    {/* Selected File Preview */}
                    {uploadedFile && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 border border-gray-700"
                        >
                            <div className="w-10 h-10 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0">
                                <File className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{uploadedFile.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setUploadedFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {/* Error Message */}
                    {uploadError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded p-3"
                        >
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{uploadError}</p>
                        </motion.div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-gray-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUploadSubmit}
                        disabled={!uploadedFile || isUploading}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-semibold disabled:opacity-50"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Document
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
