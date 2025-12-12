"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteProgram } from "./actions";

interface DeleteButtonProps {
  programId: string;
  programName: string;
}

export function DeleteButton({ programId, programName }: DeleteButtonProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!confirm(`Are you sure you want to delete "${programName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteProgram(programId);
    } catch (error) {
      console.error("Failed to delete program:", error);
      alert("Failed to delete program. Please try again.");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete program</span>
    </Button>
  );
} 