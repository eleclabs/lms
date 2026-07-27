import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { updateCourse } from "@/app/actions/course";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("files");
        const courseId = formData.get("courseId");

        if (!(file instanceof File) || !file.type.startsWith("image/")) {
            return NextResponse.json({
                error: "Please select a valid image file.",
            }, {
                status: 400,
            });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: "Image size must not exceed 10 MB.",
            }, {
                status: 400,
            });
        }

        if (!courseId) {
            return NextResponse.json({
                error: "Course ID is required.",
            }, {
                status: 400,
            });
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({
                error: "Cloudinary environment variables are not configured.",
            }, {
                status: 500,
            });
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const folder = "lms/courses";
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
            throw new Error(uploadResult?.error?.message || "Cloudinary upload failed.");
        }

        await updateCourse(courseId, { thumbnail: uploadResult.secure_url });

        return NextResponse.json({
            message: "Course image uploaded successfully.",
            imageUrl: uploadResult.secure_url,
        }, {
            status: 200,
        });

    } catch (err) {
        return NextResponse.json({
            error: err.message || "Image upload failed.",
        }, {
            status: 500,
        });
    }
}
