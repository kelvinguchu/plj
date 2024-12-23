"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { checkIsAdmin } from "@/lib/blogService";
import Image from "next/image";

interface PodcastGuest {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  profilePicture?: string;
}

export default function PodcastGuestManagement() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState<PodcastGuest[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkIsAdmin();
      if (!adminStatus) {
        router.push("/login");
        return;
      }
      setIsAdmin(true);
      fetchGuests();
    };
    checkAdmin();
  }, [router]);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setImageUrl(data.secure_url);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      setUploadError("Failed to upload image. Please try again.");
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchGuests = async () => {
    try {
      const q = query(
        collection(db, "podcastGuests"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const guestData = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as PodcastGuest)
      );
      setGuests(guestData);
    } catch (error) {
      console.error("Error fetching guests:", error);
    }
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Starting podcast guest creation process...");

      const response = await fetch("/api/admin/create-guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          imageUrl,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create guest");
      }

      console.log("Guest created successfully:", data);

      toast({
        title: "Success",
        description: "Podcast guest account created successfully",
        className: "bg-green-500 text-white",
      });

      // Refresh guest list
      await fetchGuests();

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setImageUrl("");
      setImageFile(null);
    } catch (error: any) {
      console.error("Error creating podcast guest:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create podcast guest",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container max-w-5xl mx-auto p-6 pt-20'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-light'>
          Manage <span className='text-[#2B4C7E]'>Podcast Guests</span>
        </h1>
        <Button
          onClick={() => router.push("/admin/blog/new")}
          className='bg-[#87CEEB]/10 text-[#2B4C7E] hover:bg-[#87CEEB]/20'>
          Back to Blog
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Create New Guest Form */}
        <div className='bg-white rounded-3xl shadow-xl border border-[#87CEEB]/20 p-8'>
          <h2 className='text-2xl font-light mb-6'>
            Create <span className='text-[#2B4C7E]'>New Guest</span>
          </h2>

          <form onSubmit={handleCreateGuest} className='space-y-6'>
            <div>
              <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                Profile Picture
              </label>
              <input
                type='file'
                accept='image/*'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    handleImageUpload(file);
                  }
                }}
                className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl'
              />
              {uploadingImage && (
                <p className='text-[#2B4C7E] mt-2'>Uploading image...</p>
              )}
              {uploadError && (
                <p className='text-red-500 mt-2'>{uploadError}</p>
              )}
              {imageUrl && (
                <div className='mt-4 relative w-full h-48 rounded-2xl overflow-hidden'>
                  <Image
                    src={imageUrl}
                    alt='Preview'
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    unoptimized
                  />
                </div>
              )}
            </div>

            <div>
              <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl'
              />
            </div>

            <div>
              <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                Email
              </label>
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl'
              />
            </div>

            <div>
              <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                Password
              </label>
              <Input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl'
              />
            </div>

            <Button
              type='submit'
              disabled={loading || uploadingImage}
              className='w-full p-4 bg-[#2B4C7E] text-white rounded-2xl hover:bg-[#2B4C7E]/90'>
              {loading ? "Creating..." : "Create Guest Account"}
            </Button>
          </form>
        </div>

        {/* Existing Guests List */}
        <div className='bg-white rounded-3xl shadow-xl border border-[#87CEEB]/20 p-8'>
          <h2 className='text-2xl font-light mb-6'>
            Existing <span className='text-[#2B4C7E]'>Guests</span>
          </h2>

          <div className='space-y-4'>
            {guests.map((guest) => (
              <div key={guest.id} className='p-4 bg-[#87CEEB]/5 rounded-2xl'>
                <div className='flex items-center gap-4'>
                  {guest.profilePicture && (
                    <div className='relative w-12 h-12 rounded-full overflow-hidden'>
                      <Image
                        src={guest.profilePicture}
                        alt={guest.name}
                        fill
                        className='object-cover'
                        sizes='48px'
                        unoptimized
                      />
                    </div>
                  )}
                  <div>
                    <h3 className='font-medium text-[#2B4C7E]'>{guest.name}</h3>
                    <p className='text-[#2B4C7E]/70 text-sm'>{guest.email}</p>
                    <p className='text-[#2B4C7E]/50 text-xs mt-1'>
                      Created: {new Date(guest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {guests.length === 0 && (
              <p className='text-center text-[#2B4C7E]/60 py-4'>
                No podcast guests yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
