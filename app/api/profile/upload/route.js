import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { User } from "@/model/user-model";
import { dbConnect } from "@/service/mongo";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You are not authenticated." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Please select a valid image file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Profile image size must not exceed 5 MB." },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary environment variables are not configured." },
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "lms/profiles";
    const signature = createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", timestamp.toString());
    cloudinaryFormData.append("folder", folder);
    cloudinaryFormData.append("signature", signature);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );
    const uploadResult = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok || !uploadResult.secure_url) {
      throw new Error(
        uploadResult?.error?.message || "Cloudinary upload failed."
      );
    }

    await dbConnect();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { profilePicture: uploadResult.secure_url },
      { new: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    revalidatePath("/account");

    return NextResponse.json({
      message: "Profile image updated successfully.",
      imageUrl: uploadResult.secure_url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Profile image upload failed." },
      { status: 500 }
    );
  }
}
