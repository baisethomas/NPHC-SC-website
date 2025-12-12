import Image from "next/image";

export default function GalleryPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Image Gallery</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          This page is a demonstration of how to correctly display images in your app.
        </p>
      </div>
      
      <div className="space-y-12 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-headline font-bold mb-4">How to Use Images</h2>
          <p className="text-muted-foreground mb-6">
            To display an image from an external website, you need its URL. Then, you must add the website&apos;s domain (e.g., &quot;www.nphchq.com&quot;) to the `remotePatterns` array in your `next.config.ts` file. This is a security measure required by Next.js.
          </p>
          <div className="p-4 bg-muted rounded-lg">
            <pre className="text-sm overflow-x-auto text-foreground/80">
{`// 1. Add the domain to next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.nphchq.com',
      },
      // ... other domains
    ],
  },
};

// 2. Use the Image component in your page
<Image 
  src="https://" 
  alt="Description" 
  width={600} 
  height={400} 
/>`}
            </pre>
          </div>
        </div>

        <div>
           <h2 className="text-2xl font-headline font-bold mb-6 text-center">Working Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-2">
              <h3 className="font-semibold">NPHC Logo</h3>
              <div className="p-4 border rounded-lg bg-white flex justify-center items-center">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FNPHC-Official-Logo-sq.png?alt=media"
                  alt="NPHC Logo"
                  width={200}
                  height={200}
                  className="rounded-lg"
                  data-ai-hint="logo crest"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">Domain: firebasestorage.googleapis.com</p>
            </div>
             <div className="space-y-2">
              <h3 className="font-semibold">Placeholder Image</h3>
               <div className="p-4 border rounded-lg flex justify-center items-center">
                  <Image 
                    src="https://placehold.co/600x400.png" 
                    alt="A placeholder image" 
                    width={200} 
                    height={200} 
                    className="rounded-lg shadow-md"
                    data-ai-hint="abstract shape"
                  />
               </div>
              <p className="text-xs text-muted-foreground text-center">Domain: placehold.co</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
