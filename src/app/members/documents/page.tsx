
'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoaderCircle, Download, FileText, ArrowLeft, Shield, Book, Users, Gavel, Search, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocuments, useDocumentMutations } from "@/hooks/useMembers";
import { Document } from "@/types/members";
import Link from "next/link";

export default function DocumentsPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showRestricted, setShowRestricted] = useState(false);

  const { data: documentsData, loading: documentsLoading, error: documentsError } = useDocuments({
    search: searchTerm,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    restricted: showRestricted ? true : undefined
  });

  const { downloadDocument, loading: downloadLoading } = useDocumentMutations();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || documentsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You must be logged in to access documents.</p>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  const documents = documentsData?.items || [];

  const handleDownload = async (doc: Document) => {
    try {
      const result = await downloadDocument(doc.id);
      // Create a temporary link to trigger download
      const link = window.document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
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

  const categorizedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4">
            <Link href="/members">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Members Portal
            </Link>
          </Button>
          <h1 className="text-3xl font-headline font-bold mb-2">Document Library</h1>
          <div className="h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4" />
          <p className="text-muted-foreground">Access important organizational documents, forms, and guidelines.</p>
        </div>

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
            {isAdmin && (
              <Button
                variant={showRestricted ? "default" : "outline"}
                onClick={() => setShowRestricted(!showRestricted)}
                className="w-full md:w-auto"
              >
                <Shield className="h-4 w-4 mr-2" />
                {showRestricted ? 'Show All' : 'Restricted Only'}
              </Button>
            )}
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

        {/* Documents Grid */}
        <div className="space-y-8">
          {Object.entries(categorizedDocuments).map(([category, docs]) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                {getCategoryIcon(category)}
                {category.charAt(0).toUpperCase() + category.slice(1)} ({docs.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {docs.map((doc) => (
                  <Card key={doc.id} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{doc.title}</CardTitle>
                            {doc.restricted && (
                              <Shield className="h-4 w-4 text-yellow-600" aria-label="Restricted Access" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getCategoryColor(doc.category)}>
                              {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                            </Badge>
                            <Badge variant="outline">v{doc.version}</Badge>
                          </div>
                        </div>
                      </div>
                      <CardDescription>{doc.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Last Updated: {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                          <span>Size: {formatFileSize(doc.fileSize)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Downloads: {doc.downloadCount || 0}
                          </span>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleDownload(doc)}
                            disabled={doc.restricted && !isAdmin || downloadLoading}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            {doc.restricted && !isAdmin ? 'Restricted' : 'Download'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          
          {documents.length === 0 && !documentsLoading && (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No documents found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your search or filters' : 'No documents available'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Document Access</h3>
            <p className="text-blue-700 text-sm">
              Some documents may be restricted based on your membership level. Contact the council secretary if you need access to restricted documents.
            </p>
          </div>
          
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Document Updates</h3>
            <p className="text-green-700 text-sm">
              Documents are regularly updated. Check the version number and last updated date to ensure you have the most current information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
