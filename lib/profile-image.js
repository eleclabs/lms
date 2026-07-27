export const DEFAULT_PROFILE_IMAGE = "/assets/images/profile.jpg";

export function getProfileImageUrl(profilePicture) {
  if (!profilePicture || profilePicture.startsWith("https://i.pravatar.cc")) {
    return DEFAULT_PROFILE_IMAGE;
  }

  return profilePicture;
}
