"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
} from "@/lib/messaging"
import type { Conversation, Message } from "@/lib/types"
import { Send, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export default function MessagesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      loadConversations()
      setUnreadCount(getUnreadCount(user.id))
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (selectedConversation && user) {
      loadMessages(selectedConversation.id)
      markMessagesAsRead(selectedConversation.id, user.id)
    }
  }, [selectedConversation, user])

  const loadConversations = () => {
    if (!user) return
    const userConversations = getUserConversations(user.id)
    setConversations(userConversations)
  }

  const loadMessages = (conversationId: string) => {
    const conversationMessages = getConversationMessages(conversationId)
    setMessages(conversationMessages)
  }

  const handleSendMessage = () => {
    if (!user || !selectedConversation || !newMessage.trim()) return

    const receiverId =
      user.id === selectedConversation.etudiantId
        ? selectedConversation.proprietaireId
        : selectedConversation.etudiantId

    sendMessage(selectedConversation.id, user.id, user.username, receiverId, newMessage.trim())

    setNewMessage("")
    loadMessages(selectedConversation.id)
    loadConversations()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground">Communiquez avec les propriétaires et étudiants</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Liste des conversations */}
            <Card className="lg:col-span-1">
              <CardContent className="p-0">
                <div className="border-b p-4">
                  <h2 className="font-semibold">Conversations</h2>
                </div>
                <div className="overflow-y-auto h-[540px]">
                  {conversations.length > 0 ? (
                    conversations.map((conversation) => {
                      const otherUserName =
                        user.id === conversation.etudiantId ? conversation.proprietaireName : conversation.etudiantName
                      const unread = messages.filter(
                        (m) => m.conversationId === conversation.id && !m.read && m.receiverId === user.id,
                      ).length

                      return (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation)}
                          className={`w-full p-4 border-b hover:bg-muted/50 transition-colors text-left ${
                            selectedConversation?.id === conversation.id ? "bg-muted" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback>{otherUserName[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-sm truncate">{otherUserName}</p>
                                {unread > 0 && (
                                  <Badge variant="default" className="ml-2">
                                    {unread}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mb-1">{conversation.listingTitle}</p>
                              {conversation.lastMessage && (
                                <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucune conversation</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Zone de messages */}
            <Card className="lg:col-span-2">
              {selectedConversation ? (
                <CardContent className="p-0 flex flex-col h-full">
                  {/* En-tête */}
                  <div className="border-b p-4">
                    <h2 className="font-semibold">
                      {user.id === selectedConversation.etudiantId
                        ? selectedConversation.proprietaireName
                        : selectedConversation.etudiantName}
                    </h2>
                    <p className="text-sm text-muted-foreground">{selectedConversation.listingTitle}</p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[440px]">
                    {messages.map((message) => {
                      const isOwn = message.senderId === user.id

                      return (
                        <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
                            <div
                              className={`rounded-lg p-3 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 px-1">
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: fr })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Zone de saisie */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Écrivez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Sélectionnez une conversation pour commencer</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
