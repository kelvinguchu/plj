import { db } from './firebase';
import { collection, getDocs, getDoc, doc, addDoc, query, orderBy, Timestamp, where, deleteDoc, updateDoc, limit, startAfter } from 'firebase/firestore';

export interface Category {
  id: string;
  name: string;
  createdAt: string;
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
}

// Category functions
export async function getCategories(): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString()
    })) as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function addCategory(name: string): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      name,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
}

// Post functions
export async function createPost(post: Omit<BlogPost, 'id'>): Promise<string> {
  try {
    let categoryName;
    if (post.categoryId) {
      const categoryDoc = await getDoc(doc(db, 'categories', post.categoryId));
      if (categoryDoc.exists()) {
        categoryName = categoryDoc.data().name;
      }
    }

    const docRef = await addDoc(collection(db, 'posts'), {
      ...post,
      categoryName,
      date: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function getSortedPostsData(): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString().split('T')[0]
    })) as BlogPost[];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPostsByCategory(categoryId: string): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('categoryId', '==', categoryId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString().split('T')[0]
    })) as BlogPost[];
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }
}

export async function getPostData(id: string): Promise<BlogPost | null> {
  try {
    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      date: data.date.toDate().toISOString().split('T')[0]
    } as BlogPost;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'posts', id));
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

export async function updatePost(id: string, data: Partial<BlogPost>): Promise<void> {
  try {
    const postRef = doc(db, 'posts', id);
    await updateDoc(postRef, data);
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

export async function getPaginatedPosts(lastPost?: any, pageSize: number = 10): Promise<BlogPost[]> {
  try {
    let q;
    if (lastPost) {
      q = query(
        collection(db, 'posts'),
        orderBy('date', 'desc'),
        startAfter(lastPost),
        limit(pageSize)
      );
    } else {
      q = query(
        collection(db, 'posts'),
        orderBy('date', 'desc'),
        limit(pageSize)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString().split('T')[0]
    })) as BlogPost[];
  } catch (error) {
    console.error('Error fetching paginated posts:', error);
    return [];
  }
} 