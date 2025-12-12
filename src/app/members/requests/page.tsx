
'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoaderCircle, ArrowLeft, Send, Calendar, DollarSign, Users, FileText, Plus, Eye, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRequests, useRequestMutations } from "@/hooks/useMembers";
import Link from "next/link";
import { Request as RequestType } from "@/types/members";

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
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You must be logged in to submit requests.</p>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  const requests = requestsData?.items || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'funding': return <DollarSign className="h-4 w-4" />;
      case 'policy': return <FileText className="h-4 w-4" />;
      case 'resource': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const requestData: Partial<Request> = {
        ...formData,
        type: formData.type as Request['type'],
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        additionalInfo: formData.type === 'funding' ? {
          fundingJustification: formData.description
        } : undefined
      };

      await createRequest(requestData as Partial<RequestType>);
      
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4">
            <Link href="/members">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Members Portal
            </Link>
          </Button>
          <h1 className="text-3xl font-headline font-bold mb-2">Submit Request</h1>
          <div className="h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4" />
          <p className="text-muted-foreground">Submit requests for events, funding, resources, and more.</p>
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Request submitted successfully! You can view it in your request history.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alerts */}
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error submitting request: {submitError}
            </AlertDescription>
          </Alert>
        )}

        {requestsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading requests: {requestsError}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submit">Submit New Request</TabsTrigger>
            <TabsTrigger value="history">My Requests ({requests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  <CardTitle>New Request Form</CardTitle>
                </div>
                <CardDescription>
                  Fill out the form below to submit your request to the council for review.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Request Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Brief title for your request"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Request Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select request type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="event">Event Proposal</SelectItem>
                          <SelectItem value="funding">Funding Request</SelectItem>
                          <SelectItem value="policy">Policy Change</SelectItem>
                          <SelectItem value="resource">Resource Request</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Provide detailed information about your request..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority Level</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
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
                      <Label htmlFor="requestedDate">Requested Date</Label>
                      <Input
                        id="requestedDate"
                        type="date"
                        value={formData.requestedDate}
                        onChange={(e) => handleInputChange('requestedDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (if applicable)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {requestsLoading ? (
              <div className="flex justify-center py-8">
                <LoaderCircle className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4">
                {requests.map((request) => (
                  <Card key={request.id} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(request.type)}
                            <CardTitle className="text-lg">{request.title}</CardTitle>
                          </div>
                          <CardDescription>{request.description}</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {request.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>Submitted: {new Date(request.submittedDate).toLocaleDateString()}</span>
                          {request.budget && (
                            <span>Budget: ${request.budget.toLocaleString()}</span>
                          )}
                        </div>
                        {request.reviewNotes && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Review Notes:</p>
                            <p className="text-sm text-gray-600 mt-1">{request.reviewNotes}</p>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            {request.reviewedBy && (
                              <span>Reviewed by: {request.reviewedByName}</span>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {requests.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No requests yet</h3>
                    <p className="text-gray-500">Submit your first request using the form above.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Request Guidelines</h3>
          <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
            <li>Event proposals should be submitted at least 30 days in advance</li>
            <li>Funding requests must include detailed budget breakdowns</li>
            <li>All requests are reviewed by the council within 14 business days</li>
            <li>You will receive email notifications about your request status</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
