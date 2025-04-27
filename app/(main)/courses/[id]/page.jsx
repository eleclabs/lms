 
import { formatPrice } from "@/lib/formatPrice";
import CourseDetailsIntro from "./_components/CourseDetailsIntro";
import CourseDetails from "./_components/CourseDetails";
import Testimonials from "./_components/Testimonials";
import RelatedCourses from "./_components/RelatedCourses";
import { getCourseDetails, getRelatedCourses } from "@/queries/courses";
import { replaceMongoIdInArray } from "@/lib/convertData";
import MoneyBack from "@/components/money-back";
 
const SingleCoursePage = async ({ params: {id} }) => {

    const course = await getCourseDetails(id);
      //console.log(course);
    const currentCourseId = course.id.toString();
    const categoryId = course.category._id.toString();

    // Fetch related courses
    const relatedCourses = await getRelatedCourses(currentCourseId,categoryId);
    // console.log(relatedCourses);
  return (
    <>
      <CourseDetailsIntro course={course} />

      <CourseDetails course={course} />
    {
      course?.testimonials && <Testimonials testimonials={replaceMongoIdInArray(course?.testimonials)} />   
    }

    <div className="mb-10">
    <MoneyBack/>
    </div>

    <div className="mb-12">
    <RelatedCourses relatedCourses={relatedCourses}/>
    </div> 
      
    </>
  );
};
export default SingleCoursePage;
