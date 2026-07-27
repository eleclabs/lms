"use client";

import { Logo } from "@/components/logo";
import { MobileSidebar } from "./mobile-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { getProfileImageUrl } from "@/lib/profile-image";

export const Navbar = () => {

  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {  
      async function fetchMe() {
          try {
              const response = await fetch("/api/me");
              const data = await response.json();
             // console.log(data);
              setLoggedInUser(data);
          } catch (error) {
              console.log(error)
          }
      }
      fetchMe();

      const updateProfileImage = (event) => {
          setLoggedInUser((currentUser) => currentUser
              ? { ...currentUser, profilePicture: event.detail.imageUrl }
              : currentUser
          );
      };
      window.addEventListener("profile-image-updated", updateProfileImage);

      return () => {
          window.removeEventListener("profile-image-updated", updateProfileImage);
      };
  },[]);



  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      <MobileSidebar />
      <div className="flex items-center justify-end  w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer">
              <Avatar>
                <AvatarImage
                  src={getProfileImageUrl(loggedInUser?.profilePicture)}
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-4">
          
          <DropdownMenuItem className="cursor-pointer">
              <Link href="/account">Profile</Link>
           </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer">
              <Link href="#" onClick={() => {signOut()}} >Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
