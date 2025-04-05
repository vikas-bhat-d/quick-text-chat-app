import axios, { formToJSON } from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { server } from "../../assets/variables";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../providers/Notification";

import { useSocket } from "../../providers/Socket";
import ChatSideBar from "../../components/ChatSideBar";
import NavBar from "../../components/NavBar";
import { useMessage } from "../../providers/Messages";
import { Image, MessageSquare, Send, X } from "lucide-react";
import { useUser } from "../../providers/User";
import { TailSpin } from "react-loader-spinner";

// function Chat() {
//   const [user, setUser] = useState();
//   const [message, setMessage] = useState("");

//   const [messages, setMessages] = useState([
//     {
//       sender: "vikas_bhat_d",
//       message: "hello",
//     },
//   ]);
//   // const [messages, setMessages] = useState("");
//   const navigate = useNavigate();

//   const socket = useSocket();

//   socket.off("join-message").on("join-message", (data) => {
//     console.log(data);
//   });

//   socket.off("message").on("message", (data) => {
//     console.log(data);
//     setMessages((prevMessages) => [data, ...prevMessages]);
//   });

//   const { notifyMistakes, notifySuccess } = useNotification();

//   useEffect(() => {
//     const callApi = async () => {
//       axios
//         .get(`${server}/api/v1/user/`, {
//           withCredentials: true,
//         })
//         .then((response) => {
//           console.log(response.data);
//           setUser((prev) => response.data);
//         })
//         .catch((error) => {
//           console.log(error);
//           notifyMistakes(error?.response?.data?.message);
//           navigate("/");
//         });
//     };

//     callApi();
//   }, []);

//   const handleLogout = async () => {
//     async function call() {
//       axios
//         .delete(`${server}/api/v1/user/logout`, {
//           withCredentials: true,
//         })
//         .then((response) => {
//           console.log(response.data);
//           localStorage.removeItem("accessToken");
//           localStorage.removeItem("refreshToken");
//           notifySuccess(response.data.message);
//           navigate("/login");
//         })
//         .catch((error) => {
//           console.log(error);
//           notifyMistakes(error?.response?.data?.message);
//         });
//     }

//     call();
//   };

//   const cloudinaryRemove = async () => {
//     console.log("called the function");
//     async function call() {
//       const response = await axios.patch(
//         `${server}/api/v1/user/editProfile`,
//         {
//           public_id: user.profilePictureId,
//         },
//         { withCredentials: true }
//       );
//       console.log(response);

//       console.log(response.data);
//     }

//     await call();
//   };

//   const sendMessage = async () => {
//     socket.emit("new-message", {
//       sender: user?.username,
//       message: message,
//     });

//     setMessage("");
//   };
//   return (
//     <div>
//       <img
//         src={user?.profilePicture}
//         alt=""
//         height="80px"
//         width="80px"
//         className="rounded-full"
//       />
//       <button onClick={handleLogout}>Logout</button>
//       <br />
//       <br />
//       <input
//         type="text"
//         placeholder="enter ur message"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//       />
//       <button onClick={() => sendMessage()}>send</button>
//       <br />
//       <br />
//       {messages.map((msg, index) => (
//         <div
//           key={index}
//           className={`message ${
//             msg.sender === user?.username ? "bg-blue-100" : "bg-pink-300"
//           } p-2 rounded-lg mb-2`}
//         >
//           <p className="text-sm">{`${msg.sender}:${msg.message}`}</p>
//         </div>
//       ))}

//       <div>{}</div>
//     </div>
//   );
// }

//static version
function Chat() {
  const { notifyMistakes, notifySuccess } = useNotification();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("user: ", user);
  }, [user]);
  const socket = useSocket();
  const {
    selectedChat,
    setSelectedChat,
    friends,
    messages,
    setMessages,
    isChatSelected,
    setIsChatSelected,
    message,
    setMessage,
    sendMessage,
    setFile,
    chatContainer,
    isMobile,
    setIsMobile,
    isMobileViewChatOpen,
    setIsMobileViewChatOpen,
    sendingMessage,
    setSendingMessage,
  } = useMessage();

  useEffect(() => {
    console.log(
      "isMobile,isMobileViewChatOpen",
      isMobile,
      isMobileViewChatOpen,
      !isMobileViewChatOpen || !isMobile,
      isMobileViewChatOpen || !isMobile
    );
  }, [isMobile, isMobileViewChatOpen]);

  socket.on("connect_error", (err) => {
    console.log(err);
    notifyMistakes(err.message);
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  return (
    <>
      <div className="flex flex-col min-h-full items-center justify-between gap-5 ">
        <NavBar />
        <div className="flex w-[calc(90%)] md:w-5/6 h-[calc(100vh-6.5rem)]">
          {/* <div className="w-full h-full flex gap-2"> */}
          {(!isMobileViewChatOpen || !isMobile) && <ChatSideBar />}

          {(isMobileViewChatOpen || !isMobile) && (
            <>
              {isChatSelected && user ? (
                <div className="flex flex-col flex-grow items-center bg-base-100 rounded-box rounded-l-none gap-2">
                  <header className=" w-full flex items-center bg-base-300 px-3 py-5 rounded-box rounded-l-none rounded-b-none justify-between">
                    <div
                      className="flex items-center gap-2 hover:cursor-pointer"
                      onClick={() => {
                        console.log("clicked the chat header");
                        navigate(`/profile/${selectedChat?._id}`);
                      }}
                    >
                      <img
                        className="size-8 rounded-full border-2 border-primary"
                        src={selectedChat?.profilePicture}
                        onError={(e) => (e.target.src = "/user.png")}
                      />
                      <p>{selectedChat?.username}</p>
                    </div>
                    <div>
                      <X
                        size={18}
                        onClick={() => {
                          console.log(isChatSelected);
                          setSelectedChat(() => null);
                          setIsMobileViewChatOpen(() => false);
                          console.log(isMobileViewChatOpen);
                          setIsChatSelected(() => false);
                        }}
                      />
                    </div>
                  </header>
                  <div
                    className="overflow-y-auto flex-grow scrollbar-thin w-full pr-3 pl-3"
                    ref={chatContainer}
                  >
                    {/* messageListings */}
                    {messages[selectedChat?._id]
                      ? messages[selectedChat?._id].map((message) => {
                          return (
                            <div
                              className={`chat mb-2 ${
                                user?._id == message.sender
                                  ? "chat-end"
                                  : "chat-start"
                              } ${user._id || "no user"}`}
                              key={message._id}
                            >
                              <div className="chat-image avatar">
                                <div className="w-8 rounded-full">
                                  <img
                                    src={
                                      user?._id == message.sender
                                        ? user?.profilePicture
                                        : selectedChat?.profilePicture
                                    }
                                    onError={(e) =>
                                      (e.target.src = "/user.png")
                                    }
                                  />
                                </div>
                              </div>
                              {message.image ? (
                                <>
                                  <div className="chat-bubble bg-base-300 p-2 max-w-3/5 md:max-w-2/5">
                                    <img
                                      src={message.image}
                                      alt=""
                                      className="max-w-full object-contain "
                                    />
                                    <div className="bg-base-300 text-base-content mt-2 ">
                                      {" "}
                                      {message.message}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="chat-bubble">
                                    {message.message}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })
                      : ""}
                  </div>
                  {/* messageInput */}
                  <div className="flex justify-center  h-16 w-full mb-2 m-auto">
                    <div className="flex w-4/5 gap-1">
                      <label className="btn btn-soft ">
                        <Image />
                        <input type="file" hidden onChange={handleFileChange} />
                      </label>
                      <label htmlFor="" className="input grow">
                        <input
                          type="text"
                          className="grow"
                          placeholder="type here"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </label>

                      <button
                        className="btn btn-soft rounded-box p-2 "
                        onClick={sendMessage}
                      >
                        {sendingMessage ? (
                          <TailSpin
                            visible={true}
                            height="20"
                            width="20"
                            color="#4fa94d"
                            ariaLabel="tail-spin-loading"
                            radius="1"
                          />
                        ) : (
                          <Send className="" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-grow items-center justify-center bg-base-100 rounded-box gap-2 rounded-l-none">
                  <div className="bg-primary/10 size-18 flex items-center justify-center rounded-box">
                    <MessageSquare className="text-primary size-14" />
                  </div>
                  <p className="text-primary-content text-3xl">
                    No chat Selected
                  </p>
                </div>
              )}
            </>
          )}

          {/* </div> */}
        </div>
      </div>
    </>
  );
}
export default Chat;
