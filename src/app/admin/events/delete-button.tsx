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
import { deleteEvent } from "./actions";
import { useToast } from "@/hooks/use-toast";

interface DeleteEventButtonProps {
  eventId: string;
  eventTitle: string;
  /** "icon" renders a ghost trash icon (desktop table); "full" renders a labeled destructive button (mobile card). */
  variant?: "icon" | "full";
}

export function DeleteEventButton({ eventId, eventTitle, variant = "icon" }: DeleteEventButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);

    const formData = new FormData();
    formData.append('id', eventId);

    try {
      await deleteEvent(formData);
      toast({
        title: "Event Deleted",
        description: `"${eventTitle}" has been deleted.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "The event could not be deleted. Please try again.",
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
            This will permanently delete the event &quot;{eventTitle}&quot;. This action cannot be undone.
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
