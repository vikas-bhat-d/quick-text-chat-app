import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../utils/axios";
import { useUser } from "./User";
import { useSocket } from "./Socket";

const messageContext = React.createContext(null);

export const useMessage = () => {
  return React.useContext(messageContext);
};

export const MessageProvider = (props) => {
  const { user } = useUser();

  const socket = useSocket();

  socket.off("message").on("message", (msg) => {
    console.log("recieved new message: ", msg);
    console.log("messages:", messages[msg.sender]);
    if (!messages[msg.sender]) {
      console.log("test");
      setMessages((prev) => ({
        ...prev,
        [msg.sender]: [],
      }));
    }
    setMessages((prev) => ({
      ...prev,
      [msg.sender]: [...messages[msg.sender], msg],
    }));

    setTimeout(() => {
      const container = chatContainer.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  });

  console.log("called message provider");
  const [friends, setFriends] = useState([]);
  const [isChatSelected, setIsChatSelected] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [prevUser, setPrevUser] = useState(null);
  const [file, setFile] = useState(null);
  const [isImage, setIsImage] = useState(false);
  const [isMobileViewChatOpen, setIsMobileViewChatOpen] = useState(false);

  const [sendingMessage, setSendingMessage] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chatContainer = useRef(null);

  const [friendRequests, setFriendsRequests] = useState(null);

  const fetchFriends = async () => {
    const friends = await axiosInstance.get("/friend/friends");
    console.log(friends);

    setFriends((prev) => friends.data.data);
  };

  const fetchRequests = async () => {
    const requests = await axiosInstance.get("/friend");
    console.log("requests ", requests.data);
    setFriendsRequests(requests.data.data);
  };

  useEffect(() => {
    // if (user?.id != prevUser?.id) {
    setLoading(true);
    fetchFriends();
    setSelectedChat(null);
    setIsChatSelected(false);
    setLoading(false);
    setPrevUser(user);
    // }
  }, [user]);

  useEffect(() => {}, [user]);

  useEffect(() => {
    if (selectedChat) fetchMessagesById();
  }, [selectedChat]);
  const fetchMessage = async () => {};

  const sendMessage = async (event, isImage = "false") => {
    if (sendingMessage) return;
    try {
      setSendingMessage(true);
      const reciever = selectedChat?._id;
      console.log(message, isImage);
      const data = new window.FormData();
      data.append("message", message);
      data.append("isImage", file != null);
      data.append("reciever", reciever);
      if (file) data.append("image", file);
      const response = await axiosInstance.post("/message/", data);

      socket.emit("new-message", response.data.data);
      setMessage("");
      setSendingMessage(false);
      console.log("message emitted");

      if (!messages[reciever]) {
        setMessages((prev) => ({
          ...prev,
          [reciever]: [],
        }));
      }

      setMessages((prev) => ({
        ...prev,
        [reciever]: [...messages[reciever], response.data.data],
      }));

      setTimeout(() => {
        const container = chatContainer.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 50);
      console.log(response.data);
    } catch (error) {
      setSendingMessage(false);
    }
  };

  const fetchMessagesById = async () => {
    const response = await axiosInstance.get(
      `/message?uid=${selectedChat?._id}`
    );
    const id = selectedChat?._id;

    console.log(response.data.data);
    setMessages((prev) => ({ ...prev, [id]: response.data.data }));
    console.log(messages);
  };

  return (
    <messageContext.Provider
      value={{
        fetchMessage,
        fetchFriends,
        friends,
        setFriends,
        isChatSelected,
        setIsChatSelected,
        selectedChat,
        setSelectedChat,
        messages,
        setMessages,
        message,
        setMessage,
        sendMessage,
        fetchMessagesById,
        loading,
        setLoading,
        searchResult,
        setSearchResult,
        fetchRequests,
        friendRequests,
        file,
        setFile,
        chatContainer,
        isMobile,
        setIsMobile,
        isMobileViewChatOpen,
        setIsMobileViewChatOpen,
        sendingMessage,
        setSendingMessage,
      }}
    >
      {props.children}
    </messageContext.Provider>
  );
};
