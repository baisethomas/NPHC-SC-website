import { Camera } from "lucide-react";

export default function GalleryPage() {
  return (
    <div>
      <section className="bg-muted py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Photo Gallery</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Moments from our events, programs, and community service across Solano County.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center py-16 max-w-xl mx-auto">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-headline font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">
              We&apos;re gathering photos from our recent events and programs. Check back soon
              to see highlights from the NPHC of Solano County community.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
