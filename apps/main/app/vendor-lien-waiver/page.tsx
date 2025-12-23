"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Download,
    Upload,
    HelpCircle,
    Loader2,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { DocumentTemplate, LienWaiverFormFields, LienWaiverFormData, UploadModal } from "@/components/lien-waiver";

export default function SignLienWaiverPage() {
    const documentRef = useRef<HTMLDivElement>(null);

    // Form state
    const [formData, setFormData] = useState<LienWaiverFormData>({
        vendorName: "",
        customerName: "",
        jobLocation: "",
        owner: "",
        throughDate: undefined,
        amountOfCheck: "",
        waiverReleaseDate: undefined,
        unpaidProgressAmount: "",
        signature: null,
        claimantTitle: "",
        signatureDate: new Date(),
    });

    const handleFormDataChange = (data: Partial<LienWaiverFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    // UI state
    const [isCertified, setIsCertified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Upload modal state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Download as PDF
    const handleDownloadPdf = async () => {
        if (!documentRef.current) return;

        setIsDownloading(true);
        try {
            // Get the actual full dimensions including scroll content
            const element = documentRef.current;
            const scrollWidth = element.scrollWidth;
            const scrollHeight = element.scrollHeight;
            
            // Use standard Letter size (8.5 x 11 inches = 612 x 792 points)
            const pdfWidth = 612;
            const pdfHeight = Math.max(792, scrollHeight); // At least letter height or content height
            
            const canvas = await html2canvas(element, {
                scale: 2,
                width: scrollWidth,
                height: scrollHeight,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: scrollWidth,
                windowHeight: scrollHeight,
                onclone: (clonedDoc, clonedElement) => {
                    // Remove all stylesheets to prevent Tailwind CSS from being applied
                    const stylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style');
                    stylesheets.forEach((sheet) => sheet.remove());
                    
                    // Remove all class attributes from the cloned element and its children
                    const removeClasses = (el: Element) => {
                        el.removeAttribute('class');
                        Array.from(el.children).forEach(removeClasses);
                    };
                    removeClasses(clonedElement);
                },
            });

            const imgData = canvas.toDataURL("image/png");

            // Create PDF with proper dimensions
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: [pdfWidth, pdfHeight],
            });

            // Calculate scale to fit width while maintaining aspect ratio
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / imgWidth;
            const scaledHeight = imgHeight * ratio;

            // Add image scaled to fit PDF width
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, scaledHeight);
            pdf.save("lien-waiver.pdf");
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!formData.signature) {
            setSubmitError("Please sign the document");
            return;
        }
        if (!isCertified) {
            setSubmitError("Please certify that the information is accurate");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Generate PDF
            if (!documentRef.current) throw new Error("Document not found");

            // Get the actual full dimensions including scroll content
            const element = documentRef.current;
            const scrollWidth = element.scrollWidth;
            const scrollHeight = element.scrollHeight;
            
            // Use standard Letter size (8.5 x 11 inches = 612 x 792 points)
            const pdfWidth = 612;
            const pdfHeight = Math.max(792, scrollHeight);
            
            const canvas = await html2canvas(element, {
                scale: 2,
                width: scrollWidth,
                height: scrollHeight,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: scrollWidth,
                windowHeight: scrollHeight,
                onclone: (clonedDoc, clonedElement) => {
                    // Remove all stylesheets to prevent Tailwind CSS from being applied
                    const stylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style');
                    stylesheets.forEach((sheet) => sheet.remove());
                    
                    // Remove all class attributes from the cloned element and its children
                    const removeClasses = (el: Element) => {
                        el.removeAttribute('class');
                        Array.from(el.children).forEach(removeClasses);
                    };
                    removeClasses(clonedElement);
                },
            });

            const imgData = canvas.toDataURL("image/png");

            // Create PDF with proper dimensions
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: [pdfWidth, pdfHeight],
            });

            // Calculate scale to fit width while maintaining aspect ratio
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / imgWidth;
            const scaledHeight = imgHeight * ratio;

            // Add image scaled to fit PDF width
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, scaledHeight);
            const pdfBlob = pdf.output("blob");

            // Create FormData for upload
            const submitFormData = new FormData();
            submitFormData.append("signedPdf", pdfBlob, "signed-lien-waiver.pdf");

            // Add all form fields to FormData
            submitFormData.append("vendorName", formData.vendorName);
            submitFormData.append("customerName", formData.customerName);
            submitFormData.append("jobLocation", formData.jobLocation);
            submitFormData.append("owner", formData.owner);
            submitFormData.append("throughDate", formData.throughDate ? format(formData.throughDate, "MM/dd/yyyy") : "");
            submitFormData.append("amountOfCheck", formData.amountOfCheck);
            submitFormData.append("waiverReleaseDate", formData.waiverReleaseDate ? format(formData.waiverReleaseDate, "MM/dd/yyyy") : "");
            submitFormData.append("unpaidProgressAmount", formData.unpaidProgressAmount);
            submitFormData.append("claimantTitle", formData.claimantTitle);
            submitFormData.append("signatureDate", formData.signatureDate ? format(formData.signatureDate, "MM/dd/yyyy") : "");
            submitFormData.append("signedAt", new Date().toISOString());

            // TODO: Replace with actual API endpoint
            // const response = await fetch('/api/lien-waiver/submit', {
            //     method: 'POST',
            //     body: formData,
            // });

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            setSubmitSuccess(true);
        } catch (error) {
            console.error("Submit error:", error);
            setSubmitError("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // File upload handler
    const handleUpload = async (file: File) => {
        const uploadFormData = new FormData();
        uploadFormData.append("signedPdf", file);
        uploadFormData.append("uploadedAt", new Date().toISOString());

        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/lien-waiver/upload', {
        //     method: 'POST',
        //     body: uploadFormData,
        // });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setSubmitSuccess(true);
    };

    // Success screen
    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Successfully Submitted!
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Your signed lien waiver has been submitted successfully.
                    </p>                    
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded flex items-center justify-center">
                            <FileText className="w-4 h-4 text-gray-900" />
                        </div>
                        <span className="text-white font-semibold">Vendor Lien Waiver Portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-medium rounded border border-yellow-500/30">
                            {formData.signature ? "Ready to Submit" : "Pending Signature"}
                        </span>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <HelpCircle className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">Help / Support</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-6 overflow-hidden">
                <div className="max-w-[1800px] mx-auto h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full">
                        {/* Left Panel - Document Preview */}
                        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
                            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex-1 flex flex-col">
                                {/* Toolbar */}
                                <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
                                    <span className="text-sm text-gray-300">Document Preview</span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={handleDownloadPdf}
                                            disabled={isDownloading}
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-white"
                                        >
                                            {isDownloading ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Download className="w-4 h-4 mr-2" />
                                            )}
                                            Download PDF
                                        </Button>
                                        <Button
                                            onClick={() => setIsUploadModalOpen(true)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload
                                        </Button>
                                    </div>
                                </div>

                                {/* Document Content */}
                                <div className="flex-1 overflow-auto bg-gray-700 p-8 flex justify-center">
                                    <div ref={documentRef} style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", width: "612px", minHeight: "792px" }}>
                                        <DocumentTemplate
                                            vendorName={formData.vendorName}
                                            customerName={formData.customerName}
                                            jobLocation={formData.jobLocation}
                                            owner={formData.owner}
                                            throughDate={formData.throughDate ? format(formData.throughDate, "MM/dd/yyyy") : ""}
                                            amountOfCheck={formData.amountOfCheck}
                                            waiverReleaseDate={formData.waiverReleaseDate ? format(formData.waiverReleaseDate, "MM/dd/yyyy") : ""}
                                            unpaidProgressAmount={formData.unpaidProgressAmount}
                                            signature={formData.signature}
                                            claimantTitle={formData.claimantTitle}
                                            signatureDate={formData.signatureDate ? format(formData.signatureDate, "MM/dd/yyyy") : ""}
                                        />
                                    </div>
                                </div>

                                {/* Certification & Submit */}
                                <div className="bg-gray-800 px-4 py-4 border-t border-gray-700 flex-shrink-0">
                                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                                        <input
                                            type="checkbox"
                                            checked={isCertified}
                                            onChange={(e) => setIsCertified(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-gray-800"
                                        />
                                        <span className="text-sm text-gray-300">
                                            I certify the information is accurate and I am authorized to sign this document
                                        </span>
                                    </label>

                                    {submitError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded p-3 mb-4"
                                        >
                                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                            <p className="text-red-400 text-sm">{submitError}</p>
                                        </motion.div>
                                    )}

                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !formData.signature || !isCertified}
                                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-bold h-11 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Sign & Submit Lien Waiver"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Form Fields */}
                        <div className="lg:col-span-5 xl:col-span-4 overflow-auto">
                            <LienWaiverFormFields
                                formData={formData}
                                onFormDataChange={handleFormDataChange}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Upload Modal */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onOpenChange={setIsUploadModalOpen}
                onUpload={handleUpload}
            />
        </div>
    );
}
