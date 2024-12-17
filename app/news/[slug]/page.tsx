import React from 'react'
import { db } from '@/lib/firebase'
import { collection, query, getDocs } from 'firebase/firestore'
import { notFound } from 'next/navigation'
import BlogPost from '@/components/BlogPost'
import { slugify } from '@/lib/utils'

interface FirestorePost {
  title: string
  content: string
  contentHtml: string
  date: any
  image: string
  categoryName: string
  categoryId: string
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  try {
    // Get all posts and find the matching one
    const postsRef = collection(db, 'posts')
    const querySnapshot = await getDocs(postsRef)
    
    const matchingPost = querySnapshot.docs.find(doc => {
      const postData = doc.data() as FirestorePost
      const postSlug = slugify(postData.title)
      return postSlug === params.slug
    })
    
    if (!matchingPost) {
      return notFound()
    }
    
    const postData = matchingPost.data() as FirestorePost
    const post = {
      id: matchingPost.id,
      ...postData,
      // Convert Timestamp to string to avoid serialization issues
      date: postData.date.toDate().toISOString()
    }

    return <BlogPost post={post} />
  } catch (error) {
    console.error('Error in page component:', error)
    return <div>Error loading post. Please try again later.</div>
  }
} 