const LOCAL_COURSE_IMAGE_PATH = "/assets/images/courses";

export function getCourseImageUrl(thumbnail) {
  if (!thumbnail) {
    return null;
  }

  if (/^https?:\/\//i.test(thumbnail) || thumbnail.startsWith("/")) {
    return thumbnail;
  }

  return `${LOCAL_COURSE_IMAGE_PATH}/${thumbnail}`;
}
