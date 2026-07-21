
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateDivineNineOrganization } from "../../../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { DivineNineDoc } from "@/lib/definitions";
import { LoaderCircle, X } from "lucide-react";
import Image from "next/image";

export function EditDivineNineForm({ organization }: { organization: DivineNineDoc }) {
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
      formData.set("id", organization.id);
      if (selectedFile) {
        formData.set("logo", selectedFile);
      } else {
        formData.delete("logo");
      }

      const result = await updateDivineNineOrganization(formData);

      if ("error" in result) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: result.error,
        });
      } else {
        toast({
          title: "Organization Updated!",
          description: "The national organization has been updated successfully.",
        });
        router.push("/admin/organizations");
        router.refresh();
      }
    } catch (error) {
      console.error("Update failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Update Error",
        description: `An unexpected error occurred: ${errorMessage}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Divine Nine Organization</CardTitle>
        <CardDescription>
          Update the national listing for &quot;{organization.name}&quot; shown on the homepage and
          Programs page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Alpha Kappa Alpha Sorority, Inc."
              defaultValue={organization.name}
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              min={0}
              step={1}
              defaultValue={organization.order}
              required
            />
            <p className="text-sm text-muted-foreground">
              Lower numbers appear first in the grid.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Crest / Logo</Label>
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

              <div className="relative">
                {logoPreview ? (
                  <div className="relative">
                    <Image
                      src={logoPreview}
                      alt="New crest preview"
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
                ) : (
                  <Image
                    src={organization.logo}
                    alt={`${organization.name} crest`}
                    width={80}
                    height={80}
                    className="rounded-md object-contain"
                  />
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {logoPreview
                ? "New crest selected"
                : "Current crest. Choose a file to replace it (JPEG, PNG, WebP, or GIF, up to 5 MB)."}
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
