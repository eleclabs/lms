"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getProfileImageUrl } from "@/lib/profile-image";

export default function ProfileImageUpload({ imageUrl, userName }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(
    getProfileImageUrl(imageUrl)
  );
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Profile image upload failed.");
      }

      setCurrentImageUrl(result.imageUrl);
      window.dispatchEvent(
        new CustomEvent("profile-image-updated", {
          detail: { imageUrl: result.imageUrl },
        })
      );
      toast.success(result.message);
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="relative size-28 mx-auto">
      <Image
        src={currentImageUrl}
        className="size-28 rounded-full object-cover shadow dark:shadow-gray-800 ring-4 ring-slate-50 dark:ring-slate-800"
        alt={userName || "Profile image"}
        width={112}
        height={112}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={uploadImage}
        disabled={isUploading}
      />
      <button
        type="button"
        aria-label="Upload profile image"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full bg-sky-600 text-white shadow hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Camera className="size-4" />
        )}
      </button>
    </div>
  );
}
