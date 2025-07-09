"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import { Program } from "@/lib/definitions";
import { uploadProgramImage } from "@/lib/storage";

export async function getPrograms(): Promise<{ programs: Program[], error?: string }> {
  if (!adminDb) {
    return { 
      programs: [], 
      error: "Firebase Admin SDK not initialized. Cannot fetch programs." 
    };
  }
  
  try {
    const programsRef = adminDb.collection("programs");
    const querySnapshot = await programsRef.orderBy("organizationName").orderBy("name").get();
    
    const programs: Program[] = [];
    querySnapshot.forEach((doc) => {
      programs.push({
        id: doc.id,
        ...doc.data()
      } as Program);
    });
    
    return { programs };
  } catch (error) {
    console.error("Error fetching programs:", error);
    return { 
      programs: [], 
      error: "Failed to load programs. Please check your Firebase configuration." 
    };
  }
}

export async function getProgramsByOrganization(organizationName: string): Promise<{ programs: Program[], error?: string }> {
  if (!adminDb) {
    return { 
      programs: [], 
      error: "Firebase Admin SDK not initialized. Cannot fetch programs." 
    };
  }
  
  try {
    const programsRef = adminDb.collection("programs");
    const querySnapshot = await programsRef
      .where("organizationName", "==", organizationName)
      .orderBy("name")
      .get();
    
    const programs: Program[] = [];
    querySnapshot.forEach((doc) => {
      programs.push({
        id: doc.id,
        ...doc.data()
      } as Program);
    });
    
    return { programs };
  } catch (error) {
    console.error("Error fetching programs by organization:", error);
    return { 
      programs: [], 
      error: "Failed to load programs for this organization." 
    };
  }
}

export async function getProgramById(id: string): Promise<Program | null> {
  if (!adminDb) {
    console.error("Firebase Admin SDK not initialized. Cannot fetch program.");
    return null;
  }
  
  try {
    const programDoc = await adminDb.collection("programs").doc(id).get();
    if (programDoc.exists) {
      return {
        id: programDoc.id,
        ...programDoc.data()
      } as Program;
    }
    return null;
  } catch (error) {
    console.error("Error fetching program:", error);
    return null;
  }
}

export async function createProgram(formData: FormData) {
  if (!adminDb) {
    const errorMsg = 'Firebase Admin SDK not initialized. Cannot create program.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const organizationName = formData.get("organizationName") as string;
    const status = formData.get("status") as string || "active";

    if (!name || !description || !category || !organizationName) {
      throw new Error("Missing required fields");
    }

    const programData = {
      name,
      description,
      category,
      organizationName,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await adminDb.collection("programs").add(programData);
    
    revalidatePath("/admin/programs");
    revalidatePath("/programs");
  } catch (error) {
    console.error("Error creating program:", error);
    throw error;
  }
  
  redirect("/admin/programs");
}

export async function createProgramWithImage(formData: FormData) {
  if (!adminDb) {
    const errorMsg = 'Firebase Admin SDK not initialized. Cannot create program.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const organizationName = formData.get("organizationName") as string;
    const status = formData.get("status") as string || "active";
    const imageFile = formData.get("image") as File;

    if (!name || !description || !category || !organizationName) {
      throw new Error("Missing required fields");
    }

    let imageUrl = "";
    let imageHint = "";
    
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadProgramImage(imageFile);
        imageHint = "program image";
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        throw new Error('Failed to upload image. Please try again.');
      }
    }

    const programData: Partial<Program> = {
      name,
      description,
      category,
      organizationName,
      status: status as 'active' | 'inactive' | 'seasonal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (imageUrl) {
      programData.image = imageUrl;
      programData.imageHint = imageHint;
    }

    await adminDb.collection("programs").add(programData);
    
    revalidatePath("/admin/programs");
    revalidatePath("/programs");
  } catch (error) {
    console.error("Error creating program:", error);
    throw error;
  }
  
  redirect("/admin/programs");
}

export async function updateProgram(id: string, formData: FormData) {
  if (!adminDb) {
    const errorMsg = 'Firebase Admin SDK not initialized. Cannot update program.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const organizationName = formData.get("organizationName") as string;
    const status = formData.get("status") as string || "active";

    if (!name || !description || !category || !organizationName) {
      throw new Error("Missing required fields");
    }

    const programData = {
      name,
      description,
      category,
      organizationName,
      status,
      updatedAt: new Date().toISOString()
    };

    await adminDb.collection("programs").doc(id).update(programData);
    
    revalidatePath("/admin/programs");
    revalidatePath("/programs");
  } catch (error) {
    console.error("Error updating program:", error);
    throw error;
  }
  
  redirect("/admin/programs");
}

export async function updateProgramWithImage(id: string, formData: FormData) {
  if (!adminDb) {
    const errorMsg = 'Firebase Admin SDK not initialized. Cannot update program.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const organizationName = formData.get("organizationName") as string;
    const status = formData.get("status") as string || "active";
    const imageFile = formData.get("image") as File;

    if (!name || !description || !category || !organizationName) {
      throw new Error("Missing required fields");
    }

    const programData: Partial<Program> = {
      name,
      description,
      category,
      organizationName,
      status: status as 'active' | 'inactive' | 'seasonal',
      updatedAt: new Date().toISOString()
    };

    if (imageFile && imageFile.size > 0) {
      try {
        const imageUrl = await uploadProgramImage(imageFile);
        programData.image = imageUrl;
        programData.imageHint = "program image";
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        throw new Error('Failed to upload image. Please try again.');
      }
    }

    await adminDb.collection("programs").doc(id).update(programData);
    
    revalidatePath("/admin/programs");
    revalidatePath("/programs");
  } catch (error) {
    console.error("Error updating program:", error);
    throw error;
  }
  
  redirect("/admin/programs");
}

export async function deleteProgram(id: string) {
  if (!adminDb) {
    const errorMsg = 'Firebase Admin SDK not initialized. Cannot delete program.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  try {
    await adminDb.collection("programs").doc(id).delete();
    
    revalidatePath("/admin/programs");
    revalidatePath("/programs");
  } catch (error) {
    console.error("Error deleting program:", error);
    throw error;
  }
} 