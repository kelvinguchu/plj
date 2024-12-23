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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface PodcastGuest {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  profilePicture?: string;
}

const EditGuestDialog = ({
  guest,
  isOpen,
  onClose,
  onUpdate,
}: {
  guest: PodcastGuest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (guestId: string, data: Partial<PodcastGuest>) => Promise<void>;
}) => {
  const [name, setName] = useState(guest?.name || "");
  const [email, setEmail] = useState(guest?.email || "");
  const [imageUrl, setImageUrl] = useState(guest?.profilePicture || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (guest) {
      setName(guest.name);
      setEmail(guest.email);
      setImageUrl(guest.profilePicture || "");
    }
  }, [guest]);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
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
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;

    const updatedData: Partial<PodcastGuest> = {
      name,
      email,
      ...(imageUrl && { profilePicture: imageUrl }),
    };

    await onUpdate(guest.id, updatedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px] bg-white'>
        <DialogHeader>
          <DialogTitle className='text-[#2B4C7E]'>Edit Guest</DialogTitle>
          <DialogDescription className='text-[#2B4C7E]/70'>
            Make changes to the guest profile here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-6 py-4'>
          <div className='space-y-4'>
            <div>
              <label className='block text-[#2B4C7E] text-sm font-medium mb-2'>
                Profile Picture
              </label>
              {imageUrl && (
                <div className='relative w-20 h-20 mb-4 rounded-full overflow-hidden'>
                  <Image
                    src={imageUrl}
                    alt='Profile'
                    fill
                    className='object-cover'
                    sizes='80px'
                    unoptimized
                  />
                </div>
              )}
              <Input
                type='file'
                accept='image/*'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className='w-full p-2 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-xl'
              />
            </div>
            <div>
              <label className='block text-[#2B4C7E] text-sm font-medium mb-2'>
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full p-2 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-xl'
                required
              />
            </div>
            <div>
              <label className='block text-[#2B4C7E] text-sm font-medium mb-2'>
                Email
              </label>
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full p-2 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-xl'
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='border-[#87CEEB]/20 text-[#2B4C7E] hover:bg-[#87CEEB]/5'>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={uploadingImage}
              className='bg-[#2B4C7E] text-white hover:bg-[#2B4C7E]/90'>
              {uploadingImage ? "Uploading..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const [editingGuest, setEditingGuest] = useState<PodcastGuest | null>(null);
  const GUESTS_PER_PAGE = 5;

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

  const handleDeleteGuest = async (guestId: string) => {
    try {
      await deleteDoc(doc(db, "podcastGuests", guestId));
      toast({
        title: "Success",
        description: "Guest deleted successfully",
        className: "bg-green-500 text-white",
      });
      fetchGuests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete guest",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGuest = async (
    guestId: string,
    updatedData: Partial<PodcastGuest>
  ) => {
    try {
      await updateDoc(doc(db, "podcastGuests", guestId), updatedData);
      toast({
        title: "Success",
        description: "Guest updated successfully",
        className: "bg-green-500 text-white",
      });
      setEditingGuest(null);
      fetchGuests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update guest",
        variant: "destructive",
      });
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(guests.length / GUESTS_PER_PAGE);
  const paginatedGuests = guests.slice(
    (currentPage - 1) * GUESTS_PER_PAGE,
    currentPage * GUESTS_PER_PAGE
  );

  return (
    <div className='container max-w-5xl mx-auto p-6 pt-20'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-light'>
          Manage <span className='text-[#2B4C7E]'>Podcast Guests</span>
        </h1>
        <Button
          onClick={() => router.push("/admin")}
          className='bg-[#87CEEB]/10 text-[#2B4C7E] hover:bg-[#87CEEB]/20'>
          Back to Dashboard
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
            {paginatedGuests.map((guest) => (
              <div key={guest.id} className='p-4 bg-[#87CEEB]/5 rounded-2xl'>
                <div className='flex items-center justify-between'>
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
                      <h3 className='font-medium text-[#2B4C7E]'>
                        {guest.name}
                      </h3>
                      <p className='text-[#2B4C7E]/70 text-sm'>{guest.email}</p>
                      <p className='text-[#2B4C7E]/50 text-xs mt-1'>
                        Created:{" "}
                        {new Date(guest.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setEditingGuest(guest)}
                      className='text-[#2B4C7E] hover:text-[#2B4C7E]/70'>
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-red-500 hover:text-red-700'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Guest</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this guest? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGuest(guest.id)}
                            className='bg-red-500 hover:bg-red-600'>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='mt-6'>
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href='#'
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) => Math.max(prev - 1, 1));
                        }}
                      />
                    </PaginationItem>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href='#'
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={page === currentPage}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href='#'
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          );
                        }}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      <EditGuestDialog
        guest={editingGuest}
        isOpen={!!editingGuest}
        onClose={() => setEditingGuest(null)}
        onUpdate={handleUpdateGuest}
      />
    </div>
  );
}
