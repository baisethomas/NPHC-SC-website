// Firebase Storage operations for file uploads and downloads

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage';
import { storage } from './firebase';

export interface FileUploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

export interface FileUploadProgress {
  progress: number;
  total: number;
  uploaded: number;
}

// Storage paths
const STORAGE_PATHS = {
  DOCUMENTS: 'documents',
  MEETING_ATTACHMENTS: 'meetings/attachments',
  MESSAGE_ATTACHMENTS: 'messages/attachments',
  REQUEST_ATTACHMENTS: 'requests/attachments',
  PROFILE_PICTURES: 'profiles/pictures'
} as const;

class StorageService {
  private generateFileName(originalName: string, category: string): string {
    const timestamp = new Date().getTime();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${category}_${timestamp}_${sanitizedName}`;
  }

  private validateFile(file: File, maxSize: number = 10 * 1024 * 1024): void {
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported');
    }
  }

  async uploadDocument(file: File, category: string = 'general'): Promise<FileUploadResult> {
    try {
      this.validateFile(file);
      
      const fileName = this.generateFileName(file.name, category);
      const filePath = `${STORAGE_PATHS.DOCUMENTS}/${fileName}`;
      const storageRef = ref(storage, filePath);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: filePath,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async uploadMeetingAttachment(file: File, meetingId: string): Promise<FileUploadResult> {
    try {
      this.validateFile(file);
      
      const fileName = this.generateFileName(file.name, `meeting_${meetingId}`);
      const filePath = `${STORAGE_PATHS.MEETING_ATTACHMENTS}/${fileName}`;
      const storageRef = ref(storage, filePath);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: filePath,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Error uploading meeting attachment:', error);
      throw error;
    }
  }

  async uploadMessageAttachment(file: File, messageId: string): Promise<FileUploadResult> {
    try {
      this.validateFile(file);
      
      const fileName = this.generateFileName(file.name, `message_${messageId}`);
      const filePath = `${STORAGE_PATHS.MESSAGE_ATTACHMENTS}/${fileName}`;
      const storageRef = ref(storage, filePath);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: filePath,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Error uploading message attachment:', error);
      throw error;
    }
  }

  async uploadRequestAttachment(file: File, requestId: string): Promise<FileUploadResult> {
    try {
      this.validateFile(file);
      
      const fileName = this.generateFileName(file.name, `request_${requestId}`);
      const filePath = `${STORAGE_PATHS.REQUEST_ATTACHMENTS}/${fileName}`;
      const storageRef = ref(storage, filePath);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: filePath,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Error uploading request attachment:', error);
      throw error;
    }
  }

  async uploadProfilePicture(file: File, userId: string): Promise<FileUploadResult> {
    try {
      // Validate image file
      if (!file.type.startsWith('image/')) {
        throw new Error('Profile picture must be an image');
      }
      
      this.validateFile(file, 2 * 1024 * 1024); // 2MB limit for profile pictures
      
      const fileName = this.generateFileName(file.name, `profile_${userId}`);
      const filePath = `${STORAGE_PATHS.PROFILE_PICTURES}/${fileName}`;
      const storageRef = ref(storage, filePath);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: filePath,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getFileMetadata(filePath: string) {
    try {
      const storageRef = ref(storage, filePath);
      return await getMetadata(storageRef);
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }

  async updateFileMetadata(filePath: string, metadata: any) {
    try {
      const storageRef = ref(storage, filePath);
      await updateMetadata(storageRef, metadata);
    } catch (error) {
      console.error('Error updating file metadata:', error);
      throw error;
    }
  }

  async listFiles(directory: string) {
    try {
      const storageRef = ref(storage, directory);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (item) => {
          const metadata = await getMetadata(item);
          const downloadURL = await getDownloadURL(item);
          
          return {
            name: item.name,
            path: item.fullPath,
            url: downloadURL,
            size: metadata.size,
            type: metadata.contentType,
            created: metadata.timeCreated,
            updated: metadata.updated
          };
        })
      );
      
      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  // Helper method to get file download URL from path
  async getDownloadURL(filePath: string): Promise<string> {
    try {
      const storageRef = ref(storage, filePath);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();

// Legacy functions for backward compatibility
export async function uploadFile(file: File): Promise<string> {
  const storageRef = ref(storage, `events/${Date.now()}-${file.name}`);
  
  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

export async function uploadAnnouncementImage(file: File): Promise<string> {
  const storageRef = ref(storage, `announcements/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

export async function uploadBoardMemberImage(file: File): Promise<string> {
  const storageRef = ref(storage, `board-members/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

export async function uploadProgramImage(file: File): Promise<string> {
  const storageRef = ref(storage, `programs/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
