import { useEffect, useRef, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import ChatItem from "../components/chat/ChatItem";
import { IoMdSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import {
  createNewSession,
  getSessionChats,
  sendChatRequest,
  updateSessionTitle
} from "../helpers/api-communicator";
import toast from "react-hot-toast";
import SidebarComponent from "../components/chat/sidebar";
type Message = {
  role: "user" | "assistant";
  content: string;
};
const Chat = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const auth = useAuth();

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const handleSubmit = async () => {
    const content = inputRef.current?.value as string;

    if (!content.trim()) {
      toast.error("Message cannot be empty");
      return; // Dừng lại nếu không có nội dung
    }

    if (inputRef && inputRef.current) {
      inputRef.current.value = "";
    }
    const newMessage: Message = { role: "user", content };
    setChatMessages((prev) => [...prev, newMessage]);

    let chatData
    try {
      let sessionId = selectedSessionId;

      if (!sessionId) {
        const newSession = await createNewSession();
        console.log("newSession: ", newSession)
        sessionId = newSession.id;
        setSelectedSessionId(sessionId);
        chatData = await sendChatRequest(sessionId, content);

        if (chatData.length !== 0) {
          const firstMessage = chatData[0]?.content;
          const title = firstMessage?.length > 50 ? firstMessage.slice(0, 50) + "..." : firstMessage;
          await updateSessionTitle(sessionId, title);
        }
      } else {
        chatData = await sendChatRequest(sessionId, content);
        if (chatData.length !== 0) {
          const firstMessage = chatData[0]?.content;
          const title = firstMessage?.length > 50 ? firstMessage.slice(0, 50) + "..." : firstMessage;
          const sessionChats = await getSessionChats(sessionId)
          if (sessionChats.title == "New Chat")
            await updateSessionTitle(sessionId, title);
        }
      }
      setChatMessages([...chatData]);
    } catch (error) {
      console.log(error);
      toast.error("Failed to send message");
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActiveSessionId(sessionId);
    try {
      toast.loading('Loading Session Chats', { id: "loadsession" });
      console.log('sessionId', sessionId)
      const sessionChats = await getSessionChats(sessionId)
      setChatMessages(sessionChats.chats)
      toast.success('Loading session chats', { id: "loadsession" });
    } catch (error) {
      console.error('Failed to load session chats:, ', error)
      toast.error('Failed to load session chats', { id: "loadsession" })
    }
  }


  //input handle

  // const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  //   if (e.key === "Enter" && !e.shiftKey) {
  //     e.preventDefault(); // ngăn xuống dòng
  //     handleSubmit(); // gửi tin nhắn
  //   }
  // }

  // const handleDeleteChats = async () => {
  //   try {
  //     toast.loading("Deleting Chats", { id: "deletechats" });
  //     await deleteUserChats();
  //     setChatMessages([]);
  //     toast.success("Deleted Chats Successfully", { id: "deletechats" });
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Deleting chats failed", { id: "deletechats" });
  //   }
  // };
  // useLayoutEffect(() => {
  //   if (auth?.isLoggedIn && auth.user) {
  //     toast.loading("Loading Chats", { id: "loadchats" });
  //     getUserChats()
  //       .then((data) => {
  //         setChatMessages([...data.chats]);
  //         toast.success("Successfully loaded chats", { id: "loadchats" });
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         toast.error("Loading Failed", { id: "loadchats" });
  //       });
  //   }
  // }, [auth]);
  useEffect(() => {
    if (!auth?.user) {
      return navigate("/login");
    }
  });
  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        width: "100%",
        height: "100%",
        mt: 3,
        gap: 3,
      }}
    >
      <Box
        sx={{
          display: { md: "flex", xs: "none", sm: "none" },
          flex: 0.2,
          flexDirection: "column",
        }}
      >
        <SidebarComponent
          onSelectSession={handleSelectSession}
          activeSessionId={activeSessionId}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flex: { md: 0.8, xs: 1, sm: 1 },
          flexDirection: "column",
          px: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: "40px",
            color: "white",
            mb: 2,
            mx: "auto",
            fontWeight: "600",
          }}
        >
          Model-Gemini 1.5 flash
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: "60vh",
            borderRadius: 3,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            overflow: "scroll",
            overflowX: "hidden",
            overflowY: "auto",
            scrollBehavior: "smooth",
            // Custom scroll
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#555555",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#888888",
            },
          }}
        >
          {chatMessages.map((chat, index) => (
            <ChatItem content={chat.content} role={chat.role} key={index} />
          ))}
        </Box>
        <div
          style={{
            width: "100%",
            borderRadius: 8,
            backgroundColor: "rgb(17,27,39)",
            display: "flex",
          }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = "auto"
              target.style.height = Math.min(target.scrollHeight, 60) + "px"
            }}
            placeholder="Nhập tin nhắn..."
            style={{
              width: "100%",
              backgroundColor: "transparent",
              padding: "20px",
              border: "none",
              outline: "none",
              color: "white",
              fontSize: "18px",
              resize: "none", // ngăn kéo giãn thủ công
              maxHeight: "300px", // tối đa 300px
              overflowY: "auto",  // hiện thanh cuộn nếu vượt quá

              //scrollbar tuy chinh
              scrollbarWidth: "thin"
            }}
          />
          <IconButton onClick={handleSubmit} sx={{ color: "white", mx: 1 }}>
            <IoMdSend />
          </IconButton>
        </div>
      </Box>
    </Box>
  );
};

export default Chat;
