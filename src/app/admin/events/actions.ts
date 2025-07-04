'use server';

import { z } from 'zod';

// Test server action
export async function testServerAction() {
  console.log('TEST SERVER ACTION CALLED');
  return { message: 'Server action is working!' };
}
import { revalidatePath } from 'next/cache';

// Lazy import Firebase functions to avoid import errors
async function getFirebaseFunctions() {
  const dataModule = await import('@/lib/data');
  const storageModule = await import('@/lib/storage');
  return { 
    addEvent: dataModule.addEvent, 
    deleteEvent: dataModule.deleteEvent, 
    uploadFile: storageModule.uploadFile 
  };
}

const fileSchema = z.instanceof(File, { message: "Image is required." })
  .refine((file) => file.size > 0, "Image is required.")
  .refine((file) => file.size <= 5_000_000, `Max file size is 5MB.`)
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type),
    "Only .jpg, .jpeg, .png and .webp formats are supported."
  );

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  date: z.string(),
  time: z.string().min(2, "Time is required."),
  location: z.string().min(2, "Location is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  photo: fileSchema,
});


export async function createEvent(formData: FormData) {
  console.log('=== EVENT CREATION DEBUG - SERVER ACTION CALLED ===');
  
  try {
    console.log('Form data entries:', [...formData.entries()]);
    
    // Basic validation first
    const title = formData.get('title');
    const date = formData.get('date');
    const photo = formData.get('photo');
    
    console.log('Basic form data check:', { title, date, photo: photo instanceof File });
    
    if (!title || !date || !photo) {
      console.error('Missing required fields');
      return { error: 'Missing required fields' };
    }
    
    const validatedFields = formSchema.safeParse({
      title: formData.get('title'),
      date: formData.get('date'),
      time: formData.get('time'),
      location: formData.get('location'),
      description: formData.get('description'),
      photo: formData.get('photo'),
    });

    if (!validatedFields.success) {
      const validationErrors = validatedFields.error.flatten().fieldErrors;
      console.error('Validation failed:', validationErrors);
      const errorMessages = Object.values(validationErrors).flat().join(', ');
      return {
        error: `Invalid fields: ${errorMessages || 'Please check the form and try again.'}`,
      };
    }
  
    console.log('Validation passed, uploading file...');
    const { photo: validatedPhoto, ...eventData } = validatedFields.data;
    
    console.log('Photo details:', {
      name: validatedPhoto.name,
      size: validatedPhoto.size,
      type: validatedPhoto.type
    });
    
    const { uploadFile } = await getFirebaseFunctions();
    const imageUrl = await uploadFile(validatedPhoto);
    console.log('File uploaded successfully:', imageUrl);
    
    const parsedDate = new Date(eventData.date);
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date format:', eventData.date);
      return { error: 'Invalid date format provided.' };
    }
    
    const formattedDate = parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    console.log('Adding event to database...');
    try {
      const { addEvent } = await getFirebaseFunctions();
      await addEvent({
        ...eventData,
        date: formattedDate,
      }, imageUrl);
      console.log('Event added successfully!');
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      const error = dbError instanceof Error ? dbError : new Error('Database operation failed');
      if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        return { error: 'Database operation failed: Firestore permission denied. Please check your security rules.' };
      }
      throw error; // Re-throw for the outer catch block
    }

    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
    
    return {};
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error('An unknown server error occurred.');
    console.error(`Event Creation Failed: ${error.message}`, {cause: error});
    console.error('Full error object:', error);
    console.error('Error stack:', error.stack);

    if (error.message.includes('storage/unauthorized')) {
        return { error: 'Upload failed: Firebase Storage permission denied. Please check your storage rules.' };
    }
    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        return { error: 'Database operation failed: Firestore permission denied. Please check your security rules.' };
    }

    return { error: `Server error: ${error.message}` };
  }
}

export async function deleteEvent(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) {
      return {
        error: 'Invalid event ID.',
      };
    }
    
    const { deleteEvent: deleteEventFromDb } = await getFirebaseFunctions();
    await deleteEventFromDb(id);
    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
    return {};
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error('An unknown error occurred during event deletion.');
    console.error(`Event Deletion Failed: ${error.message}`, {cause: error});

    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
      return { error: 'Database delete failed: Firestore permission denied. Check security rules.' };
    }
    return { error: `Server error while deleting: ${error.message}` };
  }
}
