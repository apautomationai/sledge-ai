"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { AlertCircle, UploadCloud, X, FileImage, FileText } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

import { bugReportSchema, type BugReportFormData } from "@/lib/validators";
import client from "@/lib/axios-client";
import { debugLogger } from "@/lib/debug-logger";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";

const CATEGORIES = [
  { value: "UI / UX", label: "UI / UX" },
  { value: "Invoices / AP", label: "Invoices / AP" },
  { value: "Lien Waivers", label: "Lien Waivers" },
  { value: "Vendors", label: "Vendors" },
  { value: "Projects", label: "Projects" },
  { value: "Integrations / QuickBooks", label: "Integrations / QuickBooks" },
  { value: "Performance / Speed", label: "Performance / Speed" },
  { value: "Other", label: "Other" },
] as const;

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

const ACCEPTED_FILE_TYPES =
  "image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf";

const runConfetti = () => {
  const duration = 1500;
  const end = Date.now() + duration;
  (function frame() {
    confetti({
      particleCount: 30,
      startVelocity: 40,
      spread: 100,
      ticks: 80,
      origin: { x: Math.random(), y: Math.random() * 0.6 },
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

export default function ReportBugPage() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BugReportFormData>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      category: "",
      title: "",
      description: "",
      priority: "low",
      attachment: undefined,
    },
  });

  const attachment = watch("attachment");

  const mutation = useMutation({
    mutationFn: async (data: BugReportFormData) => {
      const formData = new FormData();
      formData.append("category", data.category);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("priority", data.priority);
      formData.append("source", "sledge_in_app_reporter");

      if (data.attachment) {
        formData.append("attachment", data.attachment);
      }

      // Collect debug info and append as JSON string
      const debugInfo = debugLogger.getDebugInfo();
      console.log("Debug info being sent:", debugInfo);
      console.log("Debug info JSON:", JSON.stringify(debugInfo));
      if (debugInfo) {
        formData.append("debugInfo", JSON.stringify(debugInfo));
      }

      return client.post("/api/v1/report", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      runConfetti();
      toast.success("Thank you for your feedback! We really appreciate it.");
      reset();
    },
    onError: (error: any) => {
      console.error("Bug report error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
    },
  });

  const onSubmit = (data: BugReportFormData) => {
    mutation.mutate(data);
  };

  const handleFileChange = (file: File | undefined) => {
    setValue("attachment", file, { shouldValidate: true });
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(file);
    e.target.value = "";
  };

  const removeFile = () => {
    setValue("attachment", undefined, { shouldValidate: true });
  };

  const isImageFile = (file: File) => file.type.startsWith("image/");

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4">
        <Card className="w-full max-w-md border-2 border-[#D4AF37] py-4 gap-3">
          <CardHeader className="px-4 py-0">
            <CardTitle className="text-center text-xl font-bold">
              Having an Issue with Sledge?
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-0">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3"
            >
              {/* Category */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="category">Category</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id="category"
                        className={cn(
                          "h-9",
                          errors.category && "border-destructive",
                        )}
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Bug Title */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="title">Bug Title</Label>
                <Input
                  id="title"
                  placeholder="Briefly describe the issue..."
                  {...register("title")}
                  className={cn("h-9", errors.title && "border-destructive")}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Bug Description */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="description">Bug Description</Label>
                <Textarea
                  id="description"
                  placeholder="What went wrong? Steps to reproduce?"
                  {...register("description")}
                  className={cn(
                    "min-h-[60px] resize-none",
                    errors.description && "border-destructive",
                  )}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Screenshot / Attachment */}
              <div className="flex flex-col gap-1">
                <Label>Attachment (optional)</Label>
                {attachment ? (
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50">
                    {isImageFile(attachment) ? (
                      <FileImage className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="flex-shrink-0 h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-4 px-3 border-2 border-dashed rounded-lg text-center transition-colors duration-200 cursor-pointer",
                      isDragging
                        ? "border-[#D4AF37] bg-[#D4AF37]/10"
                        : "border-border hover:border-[#D4AF37]/50",
                      errors.attachment && "border-destructive",
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <UploadCloud className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-foreground">
                      Drop file or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF, PDF (max 10MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  className="hidden"
                  onChange={handleInputChange}
                />
                {errors.attachment && (
                  <p className="text-xs text-destructive">
                    {errors.attachment.message as string}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1">
                <Label>Priority</Label>
                <div className="flex items-center gap-4 flex-wrap">
                  {PRIORITIES.map((p) => (
                    <label
                      key={p.value}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <input
                        type="radio"
                        value={p.value}
                        {...register("priority")}
                        className="h-4 w-4 accent-[#D4AF37]"
                      />
                      <span className="text-sm text-foreground">{p.label}</span>
                    </label>
                  ))}
                </div>
                {errors.priority && (
                  <p className="text-xs text-destructive">
                    {errors.priority.message}
                  </p>
                )}
              </div>

              {/* Error Alert */}
              {mutation.isError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {(mutation.error as any)?.response?.data?.message ||
                      (mutation.error as any)?.message ||
                      "Failed to submit bug report. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-10 bg-gradient-to-b from-[#FFD65A] to-[#D4AF37] text-black hover:opacity-90 font-semibold"
              >
                {mutation.isPending ? "Submitting..." : "Submit Bug"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
