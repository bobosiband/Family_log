import { getData } from "../dataStore.js";

/**
 * Sends a private message between two registered users.
 * @param {number} senderId
 * @param {number} recipientId
 * @param {string} subject - max 200 chars, non-empty after trim
 * @param {string} content - non-empty after trim
 * @returns {Promise<{message: object} | {error: string, message: string}>}
 */
function sendMessage(senderId, recipientId, subject, content) {
    const data = getData();
    
    // Validate sender and recipient exist
    const sender = data.users.find(u => u.id === senderId);
    const recipient = data.users.find(u => u.id === recipientId);
    
    if (!sender) {
        return {
            error: "sender not found",
            message: "sender user does not exist"
        };
    }
    
    if (!recipient) {
        return {
            error: "recipient not found",
            message: "recipient user does not exist"
        };
    }
    
    // Sender cannot message themselves
    if (senderId === recipientId) {
        return {
            error: "invalid recipient",
            message: "you cannot send a message to yourself"
        };
    }
    
    // Validate subject and content
    const trimmedSubject = typeof subject === "string" ? subject.trim() : "";
    const trimmedContent = typeof content === "string" ? content.trim() : "";
    
    if (trimmedSubject.length === 0) {
        return {
            error: "invalid subject",
            message: "subject cannot be empty"
        };
    }
    
    if (trimmedSubject.length > 200) {
        return {
            error: "subject too long",
            message: "subject must be 200 characters or less"
        };
    }
    
    if (trimmedContent.length === 0) {
        return {
            error: "invalid content",
            message: "message content cannot be empty"
        };
    }
    
    // Create and store message
    const newMessage = {
        id: ++data.totalMessagesEverCreated,
        senderId,
        recipientId,
        subject: trimmedSubject,
        content: trimmedContent,
        read: false,
        createdAt: new Date().toISOString()
    };
    
    data.messages.push(newMessage);
    
    return { message: newMessage };
}

/**
 * Returns inbox and sent messages for a user, newest first.
 * @param {number} userId
 * @returns {Promise<{inbox: object[], sent: object[]} | {error: string, message: string}>}
 */
function getUserMessages(userId) {
    const data = getData();
    
    // Validate user exists
    const user = data.users.find(u => u.id === userId);
    if (!user) {
        return {
            error: "user not found",
            message: "user does not exist"
        };
    }
    
    const inbox = data.messages
        .filter(m => m.recipientId === userId)
        .sort((a, b) => {
            const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return timeDiff !== 0 ? timeDiff : b.id - a.id;
        });
    
    const sent = data.messages
        .filter(m => m.senderId === userId)
        .sort((a, b) => {
            const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return timeDiff !== 0 ? timeDiff : b.id - a.id;
        });
    
    return { inbox, sent };
}

/**
 * Marks a message as read. Only the recipient may call this.
 * @param {number} messageId
 * @param {number} userId - must match message.recipientId
 * @returns {Promise<{success: true} | {error: string, message: string}>}
 */
function markMessageAsRead(messageId, userId) {
    const data = getData();
    
    const message = data.messages.find(m => m.id === messageId);
    
    if (!message) {
        return {
            error: "message not found",
            message: "message does not exist"
        };
    }
    
    // Only recipient can mark as read
    if (message.recipientId !== userId) {
        return {
            error: "unauthorized",
            message: "you are not the recipient of this message"
        };
    }
    
    message.read = true;
    
    return { success: true };
}

export { sendMessage, getUserMessages, markMessageAsRead };
