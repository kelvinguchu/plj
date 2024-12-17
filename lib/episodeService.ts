import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp } from "firebase/firestore";

export interface Episode {
  id: string;
  title: string;
  description: string;
  embedCode: string;
  date: string;
}

export const addEpisode = async (episodeData: Omit<Episode, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "episodes"), {
      ...episodeData,
      date: Timestamp.fromDate(new Date(episodeData.date))
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding episode:", error);
    throw error;
  }
};

export const updateEpisode = async (id: string, episodeData: Partial<Episode>) => {
  try {
    const episodeRef = doc(db, "episodes", id);
    const updateData = { ...episodeData };
    if (episodeData.date) {
      updateData.date = Timestamp.fromDate(new Date(episodeData.date));
    }
    await updateDoc(episodeRef, updateData);
  } catch (error) {
    console.error("Error updating episode:", error);
    throw error;
  }
};

export const deleteEpisode = async (id: string) => {
  try {
    const episodeRef = doc(db, "episodes", id);
    await deleteDoc(episodeRef);
  } catch (error) {
    console.error("Error deleting episode:", error);
    throw error;
  }
};

export const getEpisodes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "episodes"));
    const episodes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate().toISOString()
    })) as Episode[];

    // Sort episodes by date in descending order (newest first)
    return episodes.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error getting episodes:", error);
    throw error;
  }
}; 