
'use client';
import { useMemo, DependencyList } from 'react';
import { Query, DocumentReference } from 'firebase/firestore';

// Define a type that can be a Query or a DocumentReference, and adds our __memo flag.
type MemoizableFirebaseObject<T> = (T) & { __memo?: boolean };

/**
 * A custom hook that memoizes a Firestore Query or DocumentReference.
 * It's a wrapper around `React.useMemo` that adds a `__memo` property
 * to the returned object. This property is used by `useCollection` and `useDoc`
 * hooks to ensure that the Firebase object is stable and prevent infinite re-renders.
 *
 * @param factory A function that creates the Firestore Query or DocumentReference.
 * @param deps An array of dependencies, same as `React.useMemo`.
 * @returns The memoized Firebase object, or the factory's return value if it's null/undefined.
 */
export function useMemoFirebase<T extends Query | DocumentReference>(
  factory: () => MemoizableFirebaseObject<T> | null | undefined,
  deps: DependencyList
): MemoizableFirebaseObject<T> | null | undefined {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedValue = useMemo(() => {
    const value = factory();
    if (value) {
      // Attach the magic property to signal that this object is memoized.
      value.__memo = true;
    }
    return value;
  }, deps);

  return memoizedValue;
}
