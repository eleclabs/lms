"use server"

import { Course } from "@/model/course-model";
import { Testimonial } from "@/model/testimonial-model";

export async function createReview(data,loginid,courseId){
    // console.log(data);
    // console.log(loginid);

    const {review, rating} = data;
    try {
        const newTestimonial = await Testimonial.create({
            content: review,
            user: loginid,
            courseId,
            rating, 
        });

    if (!newTestimonial) {
        throw new Error("Failed to create a tesimonial");
    }

    // Update the course to include the tesimonial id 
    const updateCourse = await Course.findByIdAndUpdate(
        courseId,
        { $push: {testimonials: newTestimonial._id }},
        {new: true} // Return the updated coruse document
    )

    if (!updateCourse) {
        throw new Error("Failed to update the course tesimonial");
    }
    return newTestimonial;
        
    } catch (error) {
        throw new Error(error);
    }

}