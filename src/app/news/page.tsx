
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnnouncements } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function NewsPage() {
  const { announcements, error } = await getAnnouncements();

  return (
    <div>
      <section className="bg-muted py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">News & Announcements</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Stay up-to-date with the latest news, stories, and updates from the NPHC of Solano County.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          {error ? (
            <Alert variant="destructive" className="max-w-4xl mx-auto">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Loading News</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {announcements.map((item) => (
                <Card key={item.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl hover:text-primary transition-colors">
                      <Link href={`/news/${item.id}`}>{item.title}</Link>
                    </CardTitle>
                    <CardDescription>{item.date}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-4">{item.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/news/${item.id}`}>Read More</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">No News Yet</h2>
              <p className="text-muted-foreground">Check back later for announcements and updates.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
