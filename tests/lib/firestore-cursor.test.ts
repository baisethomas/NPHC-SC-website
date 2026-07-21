import { describe, expect, it } from 'vitest';
import { decodeFirestoreCursor, encodeFirestoreCursor } from '@/lib/firestore-cursor';

describe('Firestore cursor serialization', () => {
  it('round-trips a Firestore ordering value and document ID', () => {
    const cursor = encodeFirestoreCursor({
      value: '2026-07-11T12:00:00.000Z',
      id: 'document-123',
    });

    expect(decodeFirestoreCursor(cursor)).toEqual({
      value: '2026-07-11T12:00:00.000Z',
      id: 'document-123',
    });
  });

  it('rejects malformed cursors', () => {
    expect(() => decodeFirestoreCursor('not-a-cursor')).toThrow('Invalid pagination cursor');
  });
});
