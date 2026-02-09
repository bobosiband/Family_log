import { getData } from '../dataStore.js';

function editProfileBio(userId, newBio) {
    newBio = newBio.trim();
    if (newBio.length > 500) {
        return {
            error: "invalid bio",
            message: "bio cannot be longer than 500 characters"
        }
    }
    let data = getData();
    const user = data.users.find((user) => user.id === userId);
    if (!user) {
        return {
            error: "user not found",
            message: "no user with that id exists"
        }
    }
    user.bio = newBio;
    return {
        newBio
    };
}

export { 
    editProfileBio,
};