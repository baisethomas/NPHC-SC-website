'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoaderCircle, Download, Lock, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocuments, useDocumentMutations } from "@/hooks/useMembers";
import { Document } from "@/types/members";
import { PortalEmpty, PortalPageHeader, PortalSectionTitle, PortalTag } from "@/components/portal/page-header";

const CATEGORY_LABEL: Record<string, string> = {
  constitution: "Constitution",
  bylaws: "Bylaws",
  policies: "Policies",
  procedures: "Procedures",
  forms: "Forms",
  guidelines: "Guidelines",
};

function labelFor(category: string) {
  return CATEGORY_LABEL[category] ?? category.charAt(0).toUpperCase() + category.slice(1);
}

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
      <div className="flex h-[60vh] w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2 text-center">
        <h1 className="font-headline text-2xl font-bold">Access denied</h1>
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

  const categorizedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Documents"
        description="The council's governing documents, forms, and guidelines. Check the version and date before you rely on one."
        action={
          isAdmin ? (
            <Button variant={showRestricted ? "default" : "outline"} size="sm" onClick={() => setShowRestricted(!showRestricted)}>
              <Lock className="h-4 w-4" />
              {showRestricted ? 'Show all' : 'Restricted only'}
            </Button>
          ) : undefined
        }
      />

      {/* Search and filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            aria-label="Search documents"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48" aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {documentsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading documents: {documentsError}</AlertDescription>
        </Alert>
      )}

      {/* Documents by category */}
      <div className="space-y-10">
        {Object.entries(categorizedDocuments).map(([category, docs]) => (
          <section key={category}>
            <PortalSectionTitle title={labelFor(category)} count={docs.length} />
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {docs.map((doc) => {
                const locked = doc.restricted && !isAdmin;
                return (
                  <li key={doc.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-headline text-lg font-bold leading-snug">{doc.title}</p>
                        {doc.restricted && (
                          <PortalTag tone="gold">
                            <Lock className="mr-1 h-2.5 w-2.5" aria-hidden /> Restricted
                          </PortalTag>
                        )}
                      </div>
                      {doc.description && <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>}
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        v{doc.version} · Updated {new Date(doc.lastUpdated).toLocaleDateString()} · {formatFileSize(doc.fileSize)}
                        {typeof doc.downloadCount === "number" ? ` · ${doc.downloadCount} downloads` : ""}
                      </p>
                    </div>
                    <Button
                      variant={locked ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      disabled={locked || downloadLoading}
                      className={locked ? undefined : "bg-ink text-ivory hover:bg-ink/90"}
                    >
                      {locked ? <Lock className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                      {locked ? 'Restricted' : 'Download'}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {documents.length === 0 && !documentsLoading && (
          <PortalEmpty
            title="No documents found"
            description={searchTerm || selectedCategory !== 'all' ? 'Try a different search or clear the category filter.' : 'Documents will appear here once the council uploads them.'}
          />
        )}
      </div>

      <p className="border-t border-border pt-6 text-sm text-muted-foreground">
        Some documents are restricted by role. Contact the council secretary if you need access to one.
      </p>
    </div>
  );
}
