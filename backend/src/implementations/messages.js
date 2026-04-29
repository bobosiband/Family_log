import { getData } from "../dataStore.js";
import { sendEmail } from "../services/emailService.js";

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
        deletedFor: [],
        createdAt: new Date().toISOString()
    };
    
    data.messages.push(newMessage);
    
    return { message: newMessage };
}

function softDeleteMessageForUser(messageId, userId) {
    const data = getData();
    const message = data.messages.find((entry) => entry.id === messageId);

    if (!message) {
        return {
            error: "message not found",
            message: "message does not exist"
        };
    }

    const isParticipant = message.senderId === userId || message.recipientId === userId;
    if (!isParticipant) {
        return {
            error: "unauthorized",
            message: "you are not allowed to delete this message"
        };
    }

    if (!Array.isArray(message.deletedFor)) {
        message.deletedFor = [];
    }

    if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
    }

    return { success: true };
}

/**
 * Sends an email notification for a newly received message.
 * @param {object} sender
 * @param {object} recipient
 * @param {string} subject
 * @param {string} content
 */
async function notifyMessageRecipient(sender, recipient, subject, content) {
    if (!sender?.email || !recipient?.email) {
        return;
    }

    const senderLabel = sender.username || sender.name || "Someone";

    await sendEmail(
        recipient.email,
        `New message: ${subject}`,
        `<p><strong>${senderLabel}</strong> sent you a message on Fam Logs.</p>
         <p><strong>Subject:</strong> ${subject}</p>
         <p>${content}</p>`
    );
}

function decorateMessage(message, currentUserId, usersById) {
    const sender = usersById.get(message.senderId) || {};
    const recipient = usersById.get(message.recipientId) || {};

    return {
        id: message.id,
        senderId: message.senderId,
        senderUsername: sender.username || "Unknown",
        senderName: sender.name || "",
        recipientId: message.recipientId,
        recipientUsername: recipient.username || "Unknown",
        recipientName: recipient.name || "",
        subject: message.subject,
        content: message.content,
        read: Boolean(message.read),
        createdAt: message.createdAt,
        deletedFor: Array.isArray(message.deletedFor) ? message.deletedFor : [],
        isSentByCurrentUser: message.senderId === currentUserId,
    };
}

function buildConversationThreads(userId) {
    const data = getData();
    const user = data.users.find((entry) => entry.id === userId);

    if (!user) {
        return {
            error: "user not found",
            message: "user does not exist"
        };
    }

    const usersById = new Map(data.users.map((entry) => [entry.id, entry]));
    const visibleMessages = data.messages
        .filter((message) => !Array.isArray(message.deletedFor) || !message.deletedFor.includes(userId))
        .filter((message) => message.senderId === userId || message.recipientId === userId)
        .sort((left, right) => {
            const timeDiff = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
            return timeDiff !== 0 ? timeDiff : left.id - right.id;
        });

    const inbox = visibleMessages
        .filter((message) => message.recipientId === userId)
        .map((message) => decorateMessage(message, userId, usersById))
        .sort((left, right) => {
            const timeDiff = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
            return timeDiff !== 0 ? timeDiff : right.id - left.id;
        });

    const sent = visibleMessages
        .filter((message) => message.senderId === userId)
        .map((message) => decorateMessage(message, userId, usersById))
        .sort((left, right) => {
            const timeDiff = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
            return timeDiff !== 0 ? timeDiff : right.id - left.id;
        });

    const threads = new Map();

    for (const message of visibleMessages) {
        const partnerId = message.senderId === userId ? message.recipientId : message.senderId;
        const partner = usersById.get(partnerId);
        if (!partner) continue;

        const decorated = decorateMessage(message, userId, usersById);
        const existingThread = threads.get(partnerId) || {
            partnerId: partner.id,
            partnerUsername: partner.username,
            partnerName: partner.name || "",
            partnerSurname: partner.surname || "",
            partnerProfilePictureUrl: partner.profilePictureUrl || "",
            unreadCount: 0,
            lastMessageAt: message.createdAt,
            lastMessagePreview: message.content,
            messages: [],
        };

        existingThread.messages.push(decorated);

        if (new Date(message.createdAt).getTime() >= new Date(existingThread.lastMessageAt).getTime()) {
            existingThread.lastMessageAt = message.createdAt;
            existingThread.lastMessagePreview = message.content;
        }

        if (message.recipientId === userId && !message.read) {
            existingThread.unreadCount += 1;
        }

        threads.set(partnerId, existingThread);
    }

    const conversations = Array.from(threads.values())
        .map((thread) => ({
            ...thread,
            messages: thread.messages.sort((left, right) => {
                const timeDiff = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
                return timeDiff !== 0 ? timeDiff : left.id - right.id;
            }),
            partner: {
                id: thread.partnerId,
                username: thread.partnerUsername,
                name: thread.partnerName,
                surname: thread.partnerSurname,
                profilePictureUrl: thread.partnerProfilePictureUrl,
            },
        }))
        .sort((left, right) => {
            const timeDiff = new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime();
            return timeDiff !== 0 ? timeDiff : right.partnerId - left.partnerId;
        });

    return { inbox, sent, conversations };
}

/**
 * Returns inbox and sent messages for a user, newest first.
 * @param {number} userId
 * @returns {Promise<{inbox: object[], sent: object[]} | {error: string, message: string}>}
 */
function getUserMessages(userId) {
    const result = buildConversationThreads(userId);
    if ('error' in result) {
        return result;
    }

    const response = {
        inbox: result.inbox,
        sent: result.sent,
    };

    Object.defineProperty(response, 'conversations', {
        value: result.conversations,
        enumerable: false,
        configurable: true,
        writable: false,
    });

    return response;
}

function deleteMessageForUser(messageId, userId) {
    return softDeleteMessageForUser(messageId, userId);
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

export { sendMessage, getUserMessages, markMessageAsRead, notifyMessageRecipient, deleteMessageForUser };
