/**
 * Returns a safe public user object, stripping sensitive fields.
 * @param {object} user
 * @returns {{ id, username, email, name, surname, bio, profilePictureUrl, memberSince }}
 */
function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    surname: user.surname,
    bio: user.bio,
    profilePictureUrl: user.profilePictureUrl,
    memberSince: user.memberSince,
  };
}

export { sanitizeUser };
