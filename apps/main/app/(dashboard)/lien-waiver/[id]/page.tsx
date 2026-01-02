"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    FileText,
    Download,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
    DocumentTemplate,
    LienWaiverFormFields,
    type LienWaiverFormData,
} from "@/components/lien-waiver";

// Mock data for demonstration - will be replaced with API call
const mockLienWaiverData: Record<string, LienWaiverFormData & { status: string; lienWaiverNumber: string }> = {
    "1": {
        lienWaiverNumber: "LW-2025-0042",
        vendorName: "Canfield Electric",
        customerName: "Ferrocrete Builders Inc",
        jobLocation: "242061 Modera Melrose Apts Bldg 3, N Melrose Drive Oceanside, CA",
        owner: "Melrose Oceanside Apartments LLC",
        throughDate: new Date("2025-05-31"),
        amountOfCheck: "119,700.00",
        waiverReleaseDate: new Date("2025-05-04"),
        unpaidProgressAmount: "",
        signature: null,
        claimantTitle: "",
        signatureDate: undefined,
        status: "Requested",
    },
    "2": {
        lienWaiverNumber: "LW-2025-0039",
        vendorName: "Summit Concrete",
        customerName: "Ferrocrete Builders Inc",
        jobLocation: "1500 Industrial Blvd, San Diego, CA",
        owner: "Summit Industrial LLC",
        throughDate: new Date("2025-05-31"),
        amountOfCheck: "85,000.00",
        waiverReleaseDate: new Date("2025-04-30"),
        unpaidProgressAmount: "",
        signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        claimantTitle: "Project Manager",
        signatureDate: new Date("2025-04-30"),
        status: "Pending Signature",
    },
    "3": {
        lienWaiverNumber: "LW-2025-0028",
        vendorName: "Ace Plumbing",
        customerName: "Ferrocrete Builders Inc",
        jobLocation: "789 Commercial Way, Los Angeles, CA",
        owner: "Commercial Properties Inc",
        throughDate: new Date("2025-04-21"),
        amountOfCheck: "45,500.00",
        waiverReleaseDate: new Date("2025-04-12"),
        unpaidProgressAmount: "5,000.00",
        signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        claimantTitle: "A/R Supervisor",
        signatureDate: new Date("2025-04-12"),
        status: "Completed",
    },
};

function getStatusBadge(status: string) {
    switch (status) {
        case "Completed":
            return (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded border border-green-500/30 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                </span>
            );
        case "Pending Signature":
            return (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-medium rounded border border-yellow-500/30 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending Signature
                </span>
            );
        case "Requested":
            return (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded border border-blue-500/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Requested
                </span>
            );
        default:
            return null;
    }
}

export default function LienWaiverDetailPage() {
    const params = useParams();
    const router = useRouter();
    const documentRef = useRef<HTMLDivElement>(null);
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [lienWaiver, setLienWaiver] = useState<(LienWaiverFormData & { status: string; lienWaiverNumber: string }) | null>(null);

    useEffect(() => {
        fetchLienWaiver();
    }, [id]);

    const fetchLienWaiver = async () => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await client.get(`/api/v1/lien-waivers/${id}`);
            // setLienWaiver(response.data);

            // Using mock data for now
            await new Promise((resolve) => setTimeout(resolve, 500));
            const data = mockLienWaiverData[id];
            if (data) {
                setLienWaiver(data);
            }
        } catch (error) {
            console.error("Error fetching lien waiver:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!documentRef.current) return;

        setIsDownloading(true);
        try {
            const element = documentRef.current;
            const scrollWidth = element.scrollWidth;
            const scrollHeight = element.scrollHeight;

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
                    const stylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style');
                    stylesheets.forEach((sheet) => sheet.remove());

                    const removeClasses = (el: Element) => {
                        el.removeAttribute("class");
                        Array.from(el.children).forEach(removeClasses);
                    };
                    removeClasses(clonedElement);
                },
            });

            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: [pdfWidth, pdfHeight],
            });

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / imgWidth;
            const scaledHeight = imgHeight * ratio;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, scaledHeight);
            pdf.save(`lien-waiver-${lienWaiver?.lienWaiverNumber || id}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
            </div>
        );
    }

    if (!lienWaiver) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] gap-4">
                <AlertCircle className="w-12 h-12 text-gray-500" />
                <h2 className="text-xl font-semibold text-white">Lien Waiver Not Found</h2>
                <p className="text-gray-400">The requested lien waiver could not be found.</p>
                <Button
                    variant="outline"
                    onClick={() => router.push("/lien-waiver")}
                    className="mt-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Lien Waivers
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/lien-waiver")}
                        className="text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                {lienWaiver.lienWaiverNumber}
                            </h1>
                            {getStatusBadge(lienWaiver.status)}
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {lienWaiver.vendorName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                {/* Left Panel - Document Preview */}
                <div className="lg:col-span-7 xl:col-span-8">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col" style={{ height: "calc(100vh - 12rem)" }}>
                        {/* Toolbar */}
                        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
                            <span className="text-sm text-gray-300">Document Preview</span>
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
                        </div>

                        {/* Document Content */}
                        <div className="flex-1 overflow-auto bg-gray-700 p-8 flex justify-center">
                            <div
                                ref={documentRef}
                                style={{
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                    width: "612px",
                                    minHeight: "792px",
                                }}
                            >
                                <DocumentTemplate
                                    vendorName={lienWaiver.vendorName}
                                    customerName={lienWaiver.customerName}
                                    jobLocation={lienWaiver.jobLocation}
                                    owner={lienWaiver.owner}
                                    throughDate={lienWaiver.throughDate ? format(lienWaiver.throughDate, "MM/dd/yyyy") : ""}
                                    amountOfCheck={lienWaiver.amountOfCheck}
                                    waiverReleaseDate={lienWaiver.waiverReleaseDate ? format(lienWaiver.waiverReleaseDate, "MM/dd/yyyy") : ""}
                                    unpaidProgressAmount={lienWaiver.unpaidProgressAmount}
                                    signature={lienWaiver.signature}
                                    claimantTitle={lienWaiver.claimantTitle}
                                    signatureDate={lienWaiver.signatureDate ? format(lienWaiver.signatureDate, "MM/dd/yyyy") : ""}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form Fields (Read-only) */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 12rem)" }}>
                        <LienWaiverFormFields
                            formData={lienWaiver}
                            readOnly={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
