import { useEffect, useState, useCallback } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { DayData } from '../types';
import { loadAllData, saveAllData } from '../utils/storage';

export function useFirebaseSync(user: User | null) {
  const [allData, setAllData] = useState<Record<string, DayData>>({});
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [cloudSynced, setCloudSynced] = useState<boolean>(false);

  // Load local data initially
  useEffect(() => {
    const local = loadAllData();
    setAllData(local);
  }, []);

  // Sync with Firestore when user is logged in
  useEffect(() => {
    if (!user) {
      setCloudSynced(false);
      return;
    }

    setIsSyncing(true);
    const daysCollectionPath = `users/${user.uid}/days`;

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'days'),
      (snapshot) => {
        const cloudData: Record<string, DayData> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as DayData;
          if (data && data.date) {
            cloudData[data.date] = data;
          }
        });

        // Merge cloud data with existing local data
        setAllData((prev) => {
          const merged = { ...prev, ...cloudData };
          saveAllData(merged);
          return merged;
        });

        setIsSyncing(false);
        setCloudSynced(true);
      },
      (error) => {
        setIsSyncing(false);
        handleFirestoreError(error, OperationType.GET, daysCollectionPath);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Save/Update day data locally and to Firestore if authenticated
  const saveDayData = useCallback(
    async (dateStr: string, updated: DayData) => {
      // Update local state and localStorage
      setAllData((prev) => {
        const newObj = { ...prev, [dateStr]: updated };
        saveAllData(newObj);
        return newObj;
      });

      // Save to Firebase if signed in
      if (user) {
        const docPath = `users/${user.uid}/days/${dateStr}`;
        try {
          const payload = {
            ...updated,
            userId: user.uid,
            date: dateStr,
            updatedAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', user.uid, 'days', dateStr), payload, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, docPath);
        }
      }
    },
    [user]
  );

  return {
    allData,
    setAllData,
    saveDayData,
    isSyncing,
    cloudSynced,
  };
}
