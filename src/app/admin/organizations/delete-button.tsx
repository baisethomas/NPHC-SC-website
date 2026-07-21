'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { deleteOrganization } from "./actions";
import { useToast } from "@/hooks/use-toast";

interface DeleteOrganizationButtonProps {
  organizationId: string;
  organizationName: string;
  /** "icon" renders a ghost trash icon (desktop table); "full" renders a labeled destructive button (mobile card). */
  variant?: "icon" | "full";
}

export function DeleteOrganizationButton({ organizationId, organizationName, variant = "icon" }: DeleteOrganizationButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);

    const formData = new FormData();
    formData.append('id', organizationId);

    try {
      await deleteOrganization(formData);
      toast({
        title: "Organization Deleted",
        description: `"${organizationName}" has been deleted.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "The organization could not be deleted. Please try again.",
      });
    }

    setIsDeleting(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {variant === "icon" ? (
          <Button variant="ghost" size="icon" disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        ) : (
          <Button variant="destructive" size="sm" className="h-8" disabled={isDeleting}>
            <Trash2 className="h-3 w-3 mr-2" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the organization &quot;{organizationName}&quot;. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
