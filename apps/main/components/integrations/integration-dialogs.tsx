"use client";

import React, { useState, useEffect, useMemo, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Button, ButtonProps } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import { Settings, Power } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { ActionState } from "@/app/(dashboard)/integrations/actions";

const initialState: ActionState = undefined;
const DESTRUCTIVE_CLASSES =
  "!bg-red-600 !text-white hover:!bg-red-700 dark:!bg-red-700 dark:hover:!bg-red-800";

interface SubmitButtonProps {
  label: string;
  variant: ButtonProps["variant"];
  disabled?: boolean;
  name?: string;
  value?: string;
  className?: string;
  children?: React.ReactNode;
  form?: string;
}

export function SubmitButton({
  label,
  variant,
  disabled,
  name,
  value,
  className,
  children,
  form,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      form={form}
      size="sm"
      type="submit"
      variant={variant}
      disabled={disabled || pending}
      name={name}
      value={value}
      className={cn(className)}
    >
      {pending ? "Loading..." : children || label}
    </Button>
  );
}

interface ConfigureDialogProps {
  backendName: "gmail" | "outlook" | "quickbooks";
  updateStartTimeAction: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ConfigureDialog({ backendName, updateStartTimeAction, defaultOpen = false, onOpenChange }: ConfigureDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [state, formAction] = useActionState(updateStartTimeAction, initialState);

  // Update internal state when defaultOpen changes
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const dateString = useMemo(() => {
    if (!date) return "";
    // Set time to start of day in local timezone, then convert to UTC ISO string
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    return localDate.toISOString();
  }, [date]);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Start date saved successfully!");
      setIsOpen(false);
      router.refresh();
    }
    if (state?.error) {
      toast.error("Failed to save date", { description: state.error });
    }
  }, [state, router]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" /> Configure
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Start Date</DialogTitle>
          <DialogDescription>
            Select the date from which to start processing data. This can be changed later.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <input type="hidden" name="name" value={backendName} />
          <input type="hidden" name="startReading" value={dateString} />
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-red-500 text-center">{state.error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <SubmitButton label="Save Changes" variant="default" disabled={!date} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DisconnectDialogProps {
  backendName: string;
  formId: string;
}

export function DisconnectDialog({ backendName, formId }: DisconnectDialogProps) {
  const { pending } = useFormStatus();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          className={DESTRUCTIVE_CLASSES}
        >
          <Power className="h-4 w-4 mr-2" /> Disconnect
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently disconnect your {backendName} account. We will stop
            processing any new data. You can reconnect at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <SubmitButton
              form={formId}
              name="status"
              value="disconnected"
              label="Disconnect"
              variant="destructive"
              className={DESTRUCTIVE_CLASSES}
            />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

