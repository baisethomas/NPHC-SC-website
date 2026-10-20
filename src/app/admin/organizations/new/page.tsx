
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { createOrganization } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoaderCircle, X } from "lucide-react";
import Image from "next/image";

export default function NewOrganizationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setSelectedFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (selectedFile) {
        formData.set("logo", selectedFile);
      } else {
        formData.delete("logo");
      }

      const result = await createOrganization(formData);

      if ("error" in result) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: result.error,
        });
      } else {
        toast({
          title: "Organization Added!",
          description: "The new organization has been added successfully.",
        });
        router.push("/admin/organizations");
        router.refresh();
      }
    } catch (error) {
      console.error("Submission failed:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        backHref="/admin/organizations"
        backLabel="Organizations"
        title="Add chapter"
        description="A local chapter listed on the Chapters page."
      />
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Alpha Kappa Alpha Sorority, Inc."
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter">Chapter Name</Label>
            <Input
              id="chapter"
              name="chapter"
              placeholder="Mu Eta Omega Chapter"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Website Link</Label>
            <Input
              id="link"
              name="link"
              type="url"
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="president">President Name</Label>
            <Input
              id="president"
              name="president"
              placeholder="Jane Doe"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="A short description of the organization..."
              className="min-h-[150px]"
              required
              minLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Organization Logo</Label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  ref={fileInputRef}
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="cursor-pointer"
                />
              </div>

              {logoPreview && (
                <div className="relative">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    width={80}
                    height={80}
                    className="rounded-md object-contain"
                    unoptimized
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeLogo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Optional. JPEG, PNG, WebP, or GIF, up to 5 MB. A placeholder is used if none is uploaded.
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Adding...
              </>
            ) : (
              "Add Organization"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
    </div>
  );
}
