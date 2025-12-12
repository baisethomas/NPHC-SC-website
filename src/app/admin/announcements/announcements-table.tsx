'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Trash2, Download, Search, Clock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { deleteAnnouncement } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { type Announcement } from "@/lib/definitions";
import Link from "next/link";
import { DeleteAnnouncementButton } from "./delete-button";

interface AnnouncementsTableProps {
  announcements: Announcement[];
}

export function AnnouncementsTable({ announcements }: AnnouncementsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredAnnouncements.map(a => a.id) : []);
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedIds(prev => 
      checked 
        ? [...prev, id]
        : prev.filter(itemId => itemId !== id)
    );
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    
    const results = await Promise.allSettled(
      selectedIds.map(id => {
        const formData = new FormData();
        formData.append('id', id);
        return deleteAnnouncement(formData);
      })
    );

    const failed = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && result.value?.error));
    
    if (failed.length === 0) {
      toast({
        title: "Success",
        description: `${selectedIds.length} announcements deleted successfully.`,
      });
      setSelectedIds([]);
      window.location.reload();
    } else {
      toast({
        variant: "destructive",
        title: "Partial Failure",
        description: `${results.length - failed.length} announcements deleted, ${failed.length} failed.`,
      });
    }
    
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  const handleExport = () => {
    const selectedAnnouncements = announcements.filter(a => selectedIds.includes(a.id));
    const dataStr = JSON.stringify(selectedAnnouncements, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `announcements_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export Complete",
      description: `${selectedAnnouncements.length} announcements exported.`,
    });
  };

  const isAllSelected = selectedIds.length === filteredAnnouncements.length && filteredAnnouncements.length > 0;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredAnnouncements.length;

  const getStatusBadge = (announcement: Announcement) => {
    const status = announcement.status || 'published';
    const now = new Date();
    
    if (status === 'scheduled' && announcement.scheduledDate) {
      const scheduledDate = new Date(announcement.scheduledDate);
      if (scheduledDate <= now) {
        return <Badge variant="default"><Eye className="h-3 w-3 mr-1" />Auto-Published</Badge>;
      }
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
    }
    
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><EyeOff className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'published':
        return <Badge variant="default"><Eye className="h-3 w-3 mr-1" />Published</Badge>;
      default:
        return <Badge variant="default">Published</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Bulk Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedIds.length})
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Select */}
      {filteredAnnouncements.length > 0 && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={isAllSelected}
            ref={(el: HTMLButtonElement | null) => {
              if (el) el.indeterminate = isIndeterminate;
            }}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            Select All ({selectedIds.length} of {filteredAnnouncements.length} selected)
          </label>
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Select</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAnnouncements.map((announcement) => (
            <TableRow 
              key={announcement.id}
              className={selectedIds.includes(announcement.id) ? "bg-muted/50" : ""}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(announcement.id)}
                  onCheckedChange={(checked) => handleSelectItem(announcement.id, !!checked)}
                />
              </TableCell>
              <TableCell className="font-medium">{announcement.title}</TableCell>
              <TableCell>{announcement.date}</TableCell>
              <TableCell>{getStatusBadge(announcement)}</TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/announcements/${announcement.id}/edit`}>
                  <Button variant="ghost" size="icon" type="button">
                    Edit
                  </Button>
                </Link>
                <DeleteAnnouncementButton announcement={announcement} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredAnnouncements.length === 0 && searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          No announcements found matching &quot;{searchTerm}&quot;
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} announcements?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected announcements. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
