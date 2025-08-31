'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Upload, FileText, Download, Trash2, Search, AlertCircle, Shield, Book, Users, Gavel, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocuments, useDocumentMutations } from "@/hooks/useMembers";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { storageService } from "@/lib/storage";

const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  version: z.string().min(1, "Version is required"),
  restricted: z.boolean().default(false),
  tags: z.string().optional()
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export default function AdminDocumentsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: documentsData, loading: documentsLoading, error: documentsError, refetch } = useDocuments({
    search: searchTerm,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    restricted: true // Show all documents including restricted for admin
  });

  const { createDocument, deleteDocument } = useDocumentMutations();

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      version: "1.0",
      restricted: false,
      tags: ""
    }
  });

  const documents = documentsData?.items || [];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const onSubmit = async (values: DocumentFormValues) => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      
      // Upload file to storage
      const uploadResult = await storageService.uploadDocument(selectedFile, values.category);
      
      // Create document record
      const documentData = {
        ...values,
        fileUrl: uploadResult.url,
        fileName: uploadResult.name,
        fileSize: uploadResult.size,
        mimeType: uploadResult.type,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      await createDocument(documentData);
      
      // Reset form and close dialog
      form.reset();
      setSelectedFile(null);
      setIsUploadDialogOpen(false);
      refetch(); // Refresh documents list
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(documentId);
        refetch(); // Refresh documents list
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete document. Please try again.');
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'constitution': return <Book className="h-5 w-5" />;
      case 'bylaws': return <Gavel className="h-5 w-5" />;
      case 'policies': return <Shield className="h-5 w-5" />;
      case 'procedures': return <FileText className="h-5 w-5" />;
      case 'forms': return <FileText className="h-5 w-5" />;
      case 'guidelines': return <Users className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'constitution': return 'bg-blue-100 text-blue-800';
      case 'bylaws': return 'bg-green-100 text-green-800';
      case 'policies': return 'bg-red-100 text-red-800';
      case 'procedures': return 'bg-purple-100 text-purple-800';
      case 'forms': return 'bg-orange-100 text-orange-800';
      case 'guidelines': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (documentsLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>Upload and manage documents for members to access.</CardDescription>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Add a new document for members to access through the member portal.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Document title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="constitution">Constitution</SelectItem>
                          <SelectItem value="bylaws">Bylaws</SelectItem>
                          <SelectItem value="policies">Policies</SelectItem>
                          <SelectItem value="procedures">Procedures</SelectItem>
                          <SelectItem value="forms">Forms</SelectItem>
                          <SelectItem value="guidelines">Guidelines</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description of the document" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="restricted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Restricted Access</FormLabel>
                        <FormDescription>
                          Only admins can view and download this document
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="tag1, tag2, tag3" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags for better organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <label className="text-sm font-medium">File</label>
                  <div className="mt-1">
                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                    />
                    {selectedFile && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading || !selectedFile}>
                    {uploading ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="constitution">Constitution</SelectItem>
                <SelectItem value="bylaws">Bylaws</SelectItem>
                <SelectItem value="policies">Policies</SelectItem>
                <SelectItem value="procedures">Procedures</SelectItem>
                <SelectItem value="forms">Forms</SelectItem>
                <SelectItem value="guidelines">Guidelines</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error Alert */}
        {documentsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading documents: {documentsError}
            </AlertDescription>
          </Alert>
        )}

        {/* Documents List */}
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(doc.category)}
                      <h3 className="text-lg font-semibold">{doc.title}</h3>
                      {doc.restricted && (
                        <Shield className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(doc.category)}>
                        {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                      </Badge>
                      <Badge variant="outline">v{doc.version}</Badge>
                      {doc.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">{doc.description}</p>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Uploaded: {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                      <span>Size: {formatFileSize(doc.fileSize)}</span>
                      <span>Downloads: {doc.downloadCount || 0}</span>
                      <span>By: {doc.uploadedByName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {documents.length === 0 && !documentsLoading && (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No documents found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your search or filters' : 'Upload your first document to get started'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
