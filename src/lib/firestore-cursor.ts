export interface FirestoreCursor {
  value: string;
  id: string;
}

export function encodeFirestoreCursor(cursor: FirestoreCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

export function decodeFirestoreCursor(cursor: string): FirestoreCursor {
  try {
    const decoded: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    if (
      !decoded ||
      typeof decoded !== 'object' ||
      typeof (decoded as FirestoreCursor).value !== 'string' ||
      typeof (decoded as FirestoreCursor).id !== 'string'
    ) {
      throw new Error();
    }
    return decoded as FirestoreCursor;
  } catch {
    throw new Error('Invalid pagination cursor');
  }
}
