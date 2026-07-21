'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil } from 'lucide-react';
import { updateContentBlock, uploadContentImage, type ContentBlockView } from './actions';

const PAGE_GROUPS: ReadonlyArray<ContentBlockView['page']> = ['Homepage', 'About'];

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function BlockValuePreview({ block }: { block: ContentBlockView }) {
  if (block.type === 'image') {
    return (
      <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted">
        <Image src={block.value} alt={block.label} fill className="object-cover" sizes="400px" />
      </div>
    );
  }
  const text = block.type === 'richtext' ? stripHtml(block.value) : block.value;
  return <p className="line-clamp-3 text-sm text-muted-foreground">{text}</p>;
}

function EditBlockDialog({
  block,
  open,
  onOpenChange,
}: {
  block: ContentBlockView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [value, setValue] = useState<string>(block.value);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      let nextValue = value;

      if (block.type === 'image') {
        if (!imageFile) {
          toast({
            variant: 'destructive',
            title: 'No image selected',
            description: 'Choose a new image file, or cancel to keep the current one.',
          });
          return;
        }
        const formData = new FormData();
        formData.append('image', imageFile);
        const upload = await uploadContentImage(formData);
        if ('error' in upload) {
          toast({ variant: 'destructive', title: 'Upload failed', description: upload.error });
          return;
        }
        nextValue = upload.url;
      }

      const result = await updateContentBlock(block.key, nextValue);
      if ('error' in result) {
        toast({ variant: 'destructive', title: 'Save failed', description: result.error });
        return;
      }

      toast({ title: 'Content updated', description: `"${block.label}" has been saved.` });
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit: {block.label}</DialogTitle>
          <DialogDescription>{block.description}</DialogDescription>
        </DialogHeader>

        {block.type === 'richtext' && (
          <RichTextEditor content={value} onChange={setValue} placeholder="Enter content..." />
        )}

        {block.type === 'text' && (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter text..."
          />
        )}

        {block.type === 'image' && (
          <div className="space-y-4">
            <div className="relative h-48 w-full overflow-hidden rounded-md bg-muted">
              <Image
                src={imageFile ? URL.createObjectURL(imageFile) : block.value}
                alt={block.label}
                fill
                className="object-cover"
                sizes="600px"
                unoptimized={Boolean(imageFile)}
              />
            </div>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, or GIF, up to 5 MB.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ContentBlockList({ blocks }: { blocks: ContentBlockView[] }) {
  const [editingKey, setEditingKey] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {PAGE_GROUPS.map((page) => {
        const pageBlocks = blocks.filter((block) => block.page === page);
        if (pageBlocks.length === 0) return null;
        return (
          <section key={page}>
            <h2 className="mb-4 text-lg font-semibold">{page}</h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pageBlocks.map((block) => (
                <Card key={block.key} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{block.label}</CardTitle>
                      <Badge variant="secondary" className="shrink-0 capitalize">
                        {block.type === 'richtext' ? 'Rich text' : block.type}
                      </Badge>
                    </div>
                    <CardDescription>{block.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <BlockValuePreview block={block} />
                  </CardContent>
                  <CardFooter className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {block.updatedAt
                        ? `Last updated ${formatUpdatedAt(block.updatedAt)}`
                        : 'Using default content'}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setEditingKey(block.key)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </CardFooter>
                  {editingKey === block.key && (
                    <EditBlockDialog
                      block={block}
                      open={editingKey === block.key}
                      onOpenChange={(open) => setEditingKey(open ? block.key : null)}
                    />
                  )}
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
