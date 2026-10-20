'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoaderCircle, Send, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRequests, useRequestMutations } from "@/hooks/useMembers";
import { Request as RequestType } from "@/types/members";
import { PortalEmpty, PortalPageHeader, PortalTag } from "@/components/portal/page-header";

const TYPE_LABEL: Record<string, string> = {
  event: "Event proposal",
  funding: "Funding request",
  policy: "Policy change",
  resource: "Resource request",
  other: "Other",
};

function statusTone(status: RequestType["status"]) {
  switch (status) {
    case "approved":
      return "success";
    case "denied":
      return "danger";
    case "under_review":
      return "info";
    case "pending":
      return "gold";
    default:
      return "muted";
  }
}

const tabTriggerClass =
  "rounded-full border border-border px-3 py-1 text-xs data-[state=active]:border-ink data-[state=active]:bg-ink data-[state=active]:text-ivory";

export default function RequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('submit');
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    priority: 'medium' as const,
    requestedDate: '',
    budget: '',
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: requestsData, loading: requestsLoading, error: requestsError, refetch } = useRequests();
  const { createRequest, loading: submitting, error: submitError } = useRequestMutations();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
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
        <p className="text-muted-foreground">You must be logged in to submit requests.</p>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  const requests = requestsData?.items || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const requestData: Partial<RequestType> = {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        priority: formData.priority,
        requestedDate: formData.requestedDate || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        additionalInfo: formData.type === 'funding' ? {
          fundingJustification: formData.description
        } : undefined
      };

      await createRequest(requestData);

      setSubmitSuccess(true);
      setFormData({
        title: '',
        type: '',
        description: '',
        priority: 'medium',
        requestedDate: '',
        budget: '',
      });

      // Switch to history tab to show the new request
      setActiveTab('history');
      refetch();

      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);

    } catch (error) {
      console.error('Failed to submit request:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Requests"
        description="Propose an event, ask for funding or resources, or raise a policy change. The council reviews requests within 14 business days."
      />

      {submitSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-900">Request submitted. You can follow it under My requests.</AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error submitting request: {submitError}</AlertDescription>
        </Alert>
      )}

      {requestsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading requests: {requestsError}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="h-auto w-full justify-start gap-1 bg-transparent p-0">
          <TabsTrigger value="submit" className={tabTriggerClass}>New request</TabsTrigger>
          <TabsTrigger value="history" className={tabTriggerClass}>My requests ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <div className="grid gap-10 lg:grid-cols-12">
            <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-8">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="A short name for the request"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="What are you asking for, and why?"
                  rows={5}
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestedDate">Needed by</Label>
                  <Input
                    id="requestedDate"
                    type="date"
                    value={formData.requestedDate}
                    onChange={(e) => handleInputChange('requestedDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget, if any</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-border pt-6">
                <Button type="submit" disabled={submitting} className="bg-ink text-ivory hover:bg-ink/90">
                  {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? 'Submitting…' : 'Submit request'}
                </Button>
              </div>
            </form>

            <aside className="lg:col-span-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Before you submit</p>
              <ol className="mt-3 divide-y divide-border border-y border-border text-sm">
                {[
                  "Event proposals should arrive at least 30 days ahead.",
                  "Funding requests need a line-item budget.",
                  "Every request gets a decision within 14 business days.",
                  "You will be emailed when the status changes.",
                ].map((tip, i) => (
                  <li key={tip} className="flex gap-3 py-2.5">
                    <span className="font-headline font-bold tabular-nums text-gold">0{i + 1}</span>
                    <span className="text-foreground/85">{tip}</span>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="history">
          {requestsLoading ? (
            <div className="flex py-8">
              <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <PortalEmpty
              title="No requests yet"
              description="Anything you submit will show up here with its review status."
              action={
                <Button variant="outline" size="sm" onClick={() => setActiveTab('submit')}>
                  Start a request
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {requests.map((request) => (
                <li key={request.id} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:gap-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <PortalTag tone={statusTone(request.status)}>{request.status.replace('_', ' ')}</PortalTag>
                      <PortalTag>{TYPE_LABEL[request.type] ?? request.type}</PortalTag>
                      {request.priority === "high" && <PortalTag tone="danger">High priority</PortalTag>}
                    </div>
                    <h3 className="mt-2 font-headline text-xl font-bold leading-snug">{request.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted {new Date(request.submittedDate).toLocaleDateString()}
                      {request.budget ? ` · Budget $${request.budget.toLocaleString()}` : ""}
                      {request.reviewedByName ? ` · Reviewed by ${request.reviewedByName}` : ""}
                    </p>
                    <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground/85">{request.description}</p>
                    {request.reviewNotes && (
                      <blockquote className="mt-3 border-l-2 border-gold pl-3 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Review notes: </span>
                        {request.reviewNotes}
                      </blockquote>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
