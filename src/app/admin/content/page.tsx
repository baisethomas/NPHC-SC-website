import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { getContentBlocks } from './actions';
import { ContentBlockList } from './content-block-list';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const result = await getContentBlocks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Page Content</h1>
        <p className="text-muted-foreground">
          Edit the copy and images on the Homepage and About page. Changes go live immediately.
        </p>
      </div>

      {'error' in result ? (
        <Alert variant="destructive" className="max-w-2xl">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Content</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      ) : (
        <ContentBlockList blocks={result.blocks} />
      )}
    </div>
  );
}
