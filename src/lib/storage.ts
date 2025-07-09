import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

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
