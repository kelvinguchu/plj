import { db } from "./firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  query,
  orderBy,
  Timestamp,
  where,
  deleteDoc,
  updateDoc,
  limit,
  startAfter,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "./firebase";

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface PodcastGuest {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: string;
  createdAt: string;
  uid?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  contentHtml: string;
  date: string;
  image?: string;
  categoryId?: string;
  categoryName?: string;
  authorId?: string;
  authorName?: string;
  authorImage?: string;
}

export interface PendingPost extends Omit<BlogPost, "id"> {
  id: string;
  status: "pending" | "approved" | "rejected";
  authorId: string;
  submittedAt: string;
}

// Category functions
export async function getCategories(): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, orderBy("name"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString(),
    })) as Category[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function addCategory(name: string): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "categories"), {
      name,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
}

// Post functions
export async function createPost(post: Omit<BlogPost, "id">): Promise<string> {
  try {
    let categoryName;
    if (post.categoryId) {
      const categoryDoc = await getDoc(doc(db, "categories", post.categoryId));
      if (categoryDoc.exists()) {
        categoryName = categoryDoc.data().name;
      }
    }

    let authorName, authorImage, authorId;
    if (post.authorId === "admin") {
      // Set admin author details
      authorName = "Peak Life Journey";
      authorId = "admin";
    } else if (post.authorId) {
      const authorDoc = await getDoc(doc(db, "podcastGuests", post.authorId));
      if (authorDoc.exists()) {
        const authorData = authorDoc.data();
        authorName = authorData.name;
        authorImage = authorData.profilePicture;
        authorId = post.authorId;
      }
    }

    const docRef = await addDoc(collection(db, "posts"), {
      ...post,
      categoryName,
      authorName,
      authorId,
      authorImage,
      date: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export const getSortedPostsData = async () => {
  try {
    const postsRef = collection(db, "posts");
    const postsQuery = query(postsRef, orderBy("date", "desc"));
    const postsSnapshot = await getDocs(postsQuery);

    const posts = postsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        date: data.date?.toDate?.()?.toISOString() || new Date().toISOString(),
        categoryName: data.categoryName || "Uncategorized",
        image: data.image || null,
        status: "published", // These should already be published posts
        authorName: data.authorName || "Peak Life Journey",
      };
    });

    console.log("Fetched posts:", posts); // Debug log
    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export async function getPostsByCategory(
  categoryId: string
): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("categoryId", "==", categoryId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString().split("T")[0],
    })) as BlogPost[];
  } catch (error) {
    console.error("Error fetching posts by category:", error);
    return [];
  }
}

export async function getPostData(id: string): Promise<BlogPost | null> {
  try {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      date: data.date.toDate().toISOString().split("T")[0],
    } as BlogPost;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "posts", id));
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

export async function updatePost(
  id: string,
  data: Partial<BlogPost>
): Promise<void> {
  try {
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, data);
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

export async function getPaginatedPosts(
  lastPost?: any,
  pageSize: number = 10
): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, "posts");
    let q;
    if (lastPost) {
      q = query(
        postsRef,
        orderBy("date", "desc"),
        startAfter(lastPost),
        limit(pageSize)
      );
    } else {
      q = query(postsRef, orderBy("date", "desc"), limit(pageSize));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    }) as BlogPost[];
  } catch (error) {
    console.error("Error fetching paginated posts:", error);
    return [];
  }
}

export async function createPodcastGuest(
  guestData: Omit<PodcastGuest, "id" | "createdAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "podcastGuests"), {
      ...guestData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating podcast guest:", error);
    throw error;
  }
}

export async function getPodcastGuests(): Promise<PodcastGuest[]> {
  try {
    const guestsRef = collection(db, "podcastGuests");
    const q = query(guestsRef, orderBy("name"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString(),
    })) as PodcastGuest[];
  } catch (error) {
    console.error("Error fetching podcast guests:", error);
    return [];
  }
}

export async function createPendingPost(
  postData: Omit<PendingPost, "id" | "status" | "submittedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "pendingPosts"), {
      ...postData,
      status: "pending",
      submittedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating pending post:", error);
    throw error;
  }
}

export async function getPendingPosts(): Promise<PendingPost[]> {
  try {
    const postsRef = collection(db, "pendingPosts");
    const q = query(
      postsRef,
      where("status", "==", "pending"),
      orderBy("submittedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt.toDate().toISOString(),
    })) as PendingPost[];
  } catch (error) {
    console.error("Error fetching pending posts:", error);
    return [];
  }
}

export async function approvePendingPost(postId: string): Promise<void> {
  try {
    const postRef = doc(db, "pendingPosts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      throw new Error("Post not found");
    }

    const postData = postSnap.data();

    // Create approved post
    await createPost({
      title: postData.title,
      content: postData.content,
      contentHtml: postData.contentHtml,
      date: new Date().toISOString(),
      image: postData.image,
      categoryId: postData.categoryId,
      authorId: postData.authorId,
    });

    // Update pending post status
    await updateDoc(postRef, { status: "approved" });
  } catch (error) {
    console.error("Error approving post:", error);
    throw error;
  }
}

export async function rejectPendingPost(postId: string): Promise<void> {
  try {
    const postRef = doc(db, "pendingPosts", postId);
    await updateDoc(postRef, { status: "rejected" });
  } catch (error) {
    console.error("Error rejecting post:", error);
    throw error;
  }
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      return false;
    }

    // Force token refresh to get latest claims
    await user.getIdToken(true);
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims.admin === true;
  } catch (error) {
    return false;
  }
}

export async function setupAdmin(email: string) {
  try {
    const response = await fetch("/api/admin/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Failed to setup admin");
    }

    return true;
  } catch (error) {
    console.error("Error setting up admin:", error);
    return false;
  }
}
