import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, GraduationCap, Calendar, DollarSign, HandHeart } from "lucide-react";

export default function DonationsPage() {
  return (
    <div className="flex flex-col">
      {/* Vibrant Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-400 via-pink-500 to-red-500 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-transparent to-red-500/20" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full text-white shadow-lg backdrop-blur-sm">
              <Heart className="h-10 w-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-white">Support Our Community</h1>
            <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Your generous donations help us continue our mission of unity, scholarship, and community service 
              throughout Solano County. Every contribution makes a lasting impact in our community.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-xl font-semibold mb-2">Community Programs</h3>
              <p className="text-muted-foreground">
                Support youth mentorship, leadership development, and community outreach initiatives.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-xl font-semibold mb-2">Scholarships</h3>
              <p className="text-muted-foreground">
                Help fund educational scholarships for deserving students in our community.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-xl font-semibold mb-2">Events & Activities</h3>
              <p className="text-muted-foreground">
                Enable us to host meaningful events that bring our community together.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Make a Donation
              </CardTitle>
              <CardDescription>
                Choose a donation amount that works for you. Every contribution makes a difference.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-16 text-lg">
                  $25
                </Button>
                <Button variant="outline" className="h-16 text-lg">
                  $50
                </Button>
                <Button variant="outline" className="h-16 text-lg">
                  $100
                </Button>
                <Button variant="outline" className="h-16 text-lg">
                  $250
                </Button>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full h-12 text-lg bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700">
                  <Heart className="mr-2 h-5 w-5" />
                  Donate Now
                </Button>
                <Button variant="outline" className="w-full">
                  Set Up Monthly Giving
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HandHeart className="h-5 w-5" />
                Other Ways to Help
              </CardTitle>
              <CardDescription>
                There are many ways to support our mission beyond monetary donations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Volunteer</Badge>
                  <div>
                    <h4 className="font-medium">Join Our Team</h4>
                    <p className="text-sm text-muted-foreground">
                      Volunteer at events, mentor youth, or help with administrative tasks.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Sponsor</Badge>
                  <div>
                    <h4 className="font-medium">Event Sponsorship</h4>
                    <p className="text-sm text-muted-foreground">
                      Partner with us to sponsor specific events or programs.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Share</Badge>
                  <div>
                    <h4 className="font-medium">Spread the Word</h4>
                    <p className="text-sm text-muted-foreground">
                      Follow us on social media and share our mission with others.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                Learn About Volunteering
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              NPHC Solano County is a 501(c)(3) nonprofit organization. Your donation may be tax-deductible 
              to the extent allowed by law. Please consult your tax advisor for specific guidance. 
              A receipt will be provided for all donations.
            </p>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
} 