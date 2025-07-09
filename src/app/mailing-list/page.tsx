import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function MailingListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Join Our Mailing List</h1>
          <p className="text-lg text-muted-foreground">
            Stay updated with the latest news, events, and announcements from NPHC Solano County.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subscribe to Updates</CardTitle>
            <CardDescription>
              Get notified about upcoming events, community initiatives, and important announcements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" placeholder="Enter your first name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" placeholder="Enter your last name" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" placeholder="Enter your email address" required />
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Subscription Preferences</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="events" defaultChecked />
                    <Label htmlFor="events" className="text-sm font-normal">
                      Event announcements and updates
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="news" defaultChecked />
                    <Label htmlFor="news" className="text-sm font-normal">
                      Community news and achievements
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="programs" />
                    <Label htmlFor="programs" className="text-sm font-normal">
                      Program and initiative updates
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="monthly" />
                    <Label htmlFor="monthly" className="text-sm font-normal">
                      Monthly newsletter digest
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="privacy" required />
                <Label htmlFor="privacy" className="text-sm">
                  I agree to receive communications from NPHC Solano County and understand I can unsubscribe at any time.
                </Label>
              </div>

              <Button type="submit" className="w-full">
                Subscribe to Mailing List
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            We respect your privacy. Your information will only be used to send you updates about NPHC Solano County activities.
            You can unsubscribe at any time by clicking the link in our emails.
          </p>
        </div>
      </div>
    </div>
  );
} 