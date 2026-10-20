import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { getContentBlocks } from './actions';
import { ContentBlockList } from './content-block-list';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const result = await getContentBlocks();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Page content"
        description="The copy and images on the homepage and About page. Changes go live as soon as you save."
      />

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
