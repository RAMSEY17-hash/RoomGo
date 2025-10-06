import type { Message, Conversation } from "./types"

const MESSAGES_KEY = "lome_housing_messages"
const CONVERSATIONS_KEY = "lome_housing_conversations"

// Obtenir toutes les conversations
export function getConversations(): Conversation[] {
  if (typeof window === "undefined") return []

  const conversationsStr = localStorage.getItem(CONVERSATIONS_KEY)
  if (!conversationsStr) return []

  return JSON.parse(conversationsStr)
}

// Sauvegarder les conversations
function saveConversations(conversations: Conversation[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
}

// Obtenir tous les messages
export function getMessages(): Message[] {
  if (typeof window === "undefined") return []

  const messagesStr = localStorage.getItem(MESSAGES_KEY)
  if (!messagesStr) return []

  return JSON.parse(messagesStr)
}

// Sauvegarder les messages
function saveMessages(messages: Message[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
}

// Obtenir les conversations d'un utilisateur
export function getUserConversations(userId: string): Conversation[] {
  const conversations = getConversations()
  return conversations
    .filter((c) => c.etudiantId === userId || c.proprietaireId === userId)
    .sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return dateB - dateA
    })
}

// Obtenir les messages d'une conversation
export function getConversationMessages(conversationId: string): Message[] {
  const messages = getMessages()
  return messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
}

// Créer ou obtenir une conversation
export function getOrCreateConversation(
  listingId: string,
  listingTitle: string,
  etudiantId: string,
  etudiantName: string,
  proprietaireId: string,
  proprietaireName: string,
): Conversation {
  const conversations = getConversations()

  // Chercher une conversation existante
  const existing = conversations.find(
    (c) => c.listingId === listingId && c.etudiantId === etudiantId && c.proprietaireId === proprietaireId,
  )

  if (existing) {
    return existing
  }

  // Créer une nouvelle conversation
  const newConversation: Conversation = {
    id: Date.now().toString(),
    listingId,
    listingTitle,
    etudiantId,
    etudiantName,
    proprietaireId,
    proprietaireName,
    unreadCount: 0,
  }

  conversations.push(newConversation)
  saveConversations(conversations)

  return newConversation
}

// Envoyer un message
export function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  receiverId: string,
  content: string,
): Message {
  const messages = getMessages()
  const conversations = getConversations()

  const newMessage: Message = {
    id: Date.now().toString(),
    conversationId,
    senderId,
    senderName,
    receiverId,
    content,
    createdAt: new Date().toISOString(),
    read: false,
  }

  messages.push(newMessage)
  saveMessages(messages)

  // Mettre à jour la conversation
  const conversationIndex = conversations.findIndex((c) => c.id === conversationId)
  if (conversationIndex !== -1) {
    conversations[conversationIndex].lastMessage = content
    conversations[conversationIndex].lastMessageAt = newMessage.createdAt
    conversations[conversationIndex].unreadCount += 1
    saveConversations(conversations)
  }

  return newMessage
}

// Marquer les messages comme lus
export function markMessagesAsRead(conversationId: string, userId: string) {
  const messages = getMessages()
  const conversations = getConversations()

  let hasChanges = false

  const updatedMessages = messages.map((m) => {
    if (m.conversationId === conversationId && m.receiverId === userId && !m.read) {
      hasChanges = true
      return { ...m, read: true }
    }
    return m
  })

  if (hasChanges) {
    saveMessages(updatedMessages)

    // Réinitialiser le compteur de non-lus
    const conversationIndex = conversations.findIndex((c) => c.id === conversationId)
    if (conversationIndex !== -1) {
      conversations[conversationIndex].unreadCount = 0
      saveConversations(conversations)
    }
  }
}

// Obtenir le nombre total de messages non lus pour un utilisateur
export function getUnreadCount(userId: string): number {
  const conversations = getUserConversations(userId)
  return conversations.reduce((total, conv) => {
    // Compter seulement les messages non lus où l'utilisateur est le destinataire
    const messages = getConversationMessages(conv.id)
    const unread = messages.filter((m) => m.receiverId === userId && !m.read).length
    return total + unread
  }, 0)
}
