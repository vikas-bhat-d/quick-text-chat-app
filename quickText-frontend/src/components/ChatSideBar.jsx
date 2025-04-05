import React, { useEffect, useState } from "react";
import "boxicons";
import { useUser } from "../providers/User";
import { UsersRound, MessageSquare } from "lucide-react";
import { useMessage } from "../providers/Messages";
import { axiosInstance } from "../utils/axios";
import { useNavigate } from "react-router-dom";

const SkeletonFriendsList = () => {
  return (
    <ul className="list rounded-box shadow-md">
      {[...Array(5)].map((_, index) => (
        <li
          key={index}
          className="list-row flex bg-base-100 mt-2 flex-row active:bg-base-200 md:w-60 lg:w-80 animate-pulse"
        >
          <div className="size-10 rounded-full bg-gray-300 border-2 "></div>
          <div className="hidden md:block ml-3">
            <div className="h-4 w-24 bg-gray-300 rounded-md"></div>
            <div className="h-3 w-32 bg-gray-200 rounded-md mt-1"></div>
          </div>
        </li>
      ))}
    </ul>
  );
};

function ChatSideBar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    friends,
    setSelectedChat,
    setIsChatSelected,
    loading,
    setLoading,
    searchResult,
    selectedChat,
    setSearchResult,
    isMobile,
    setIsMobile,
    isMobileViewChatOpen,
    setIsMobileViewChatOpen,
  } = useMessage();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    console.log("searching:", query?.trim()?.length);

    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    if (query.trim() !== "") setLoading(true);
    else {
      // clearTimeout(handler);
      setLoading(false);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    async function call() {
      console.log("api called with query: ", debouncedQuery);
      const response = await axiosInstance.get(
        `/user/search?q=${debouncedQuery}`
      );
      console.log(response.data.data);
      setSearchResult((prev) =>
        response.data.data?.length > 0 ? response.data.data : null
      );
      setLoading(false);
    }
    if (debouncedQuery) {
      call();
    }
  }, [debouncedQuery]);

  useEffect(() => {
    console.log("friends: ", friends, loading);
  }, [friends]);
  const data = {
    sentRequests: [
      {
        _id: "67d68bae58e62b9d518d0b06",
        userOne: "679a0819f5483a6aa508832b",
        userTwo: "679cad5743bdd944134c0e2b",
        status: "pending",
        expiration: "2025-03-23T08:28:30.950Z",
        createdAt: "2025-03-16T08:28:30.953Z",
        updatedAt: "2025-03-16T08:28:30.953Z",
      },
    ],
    receivedRequests: [
      {
        _id: "67d68d240873dcc6ea9db366",
        userOne: "67d68cea0873dcc6ea9db355",
        userTwo: "679a0819f5483a6aa508832b",
        status: "pending",
        expiration: "2025-03-23T08:34:44.898Z",
        createdAt: "2025-03-16T08:34:44.899Z",
        updatedAt: "2025-03-16T08:34:44.899Z",
      },
    ],
  };

  return (
    <div className="main-com px-2 bg-base-300 overflow-y-auto scrollbar-thin min-w-full md:min-w-60 lg:min-w-80">
      <label className="input mt-2 w-full">
        <svg
          className="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          type="search"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {!loading ? (
        <ul className="list rounded-box shadow-md ">
          {query?.trim()?.length > 0 && searchResult
            ? searchResult?.map((item) => {
                return (
                  <li
                    className="list-row flex bg-base-100 mt-2 flex-row active:bg-base-200 w-full hover:cursor-pointer"
                    key={item?._id}
                    onClick={() => {
                      const updatedArray = friends.filter(
                        (i) => i._id == item._id
                      );
                      console.log("updatedArray:", updatedArray);
                      if (updatedArray.length > 0) {
                        setSelectedChat((prev) => item);
                        setIsMobileViewChatOpen(() => true);

                        setIsChatSelected(true);
                      } else {
                        navigate(`/profile/${item._id}`);
                      }
                    }}
                  >
                    <img
                      className="size-10 rounded-full border-2 border-primary"
                      src={item?.profilePicture}
                      onError={(e) => (e.target.src = "/user.png")}
                    />
                    <div className="">
                      <div className="min-w-24">{item?.username}</div>
                      <div className="min-w-32"> Message goes here</div>
                    </div>
                  </li>
                );
              })
            : friends.map((friend) => {
                return (
                  <li
                    className="list-row flex bg-base-100 mt-2 flex-row active:bg-base-200 w-full hover:cursor-pointer"
                    key={friend?._id}
                    onClick={() => {
                      setSelectedChat((prev) => friend);
                      console.log(selectedChat);
                      setIsChatSelected(true);
                      setIsMobileViewChatOpen(() => true);
                    }}
                  >
                    <img
                      className="size-10 rounded-full border-2 border-primary"
                      src={friend?.profilePicture}
                      onError={(e) => (e.target.src = "/user.png")}
                    />
                    <div className="">
                      <div className="min-w-24">{friend?.username}</div>
                      <div className="min-w-32"> Message goes here</div>
                    </div>
                  </li>
                );
              })}
        </ul>
      ) : (
        <SkeletonFriendsList />
      )}

      {/* <SkeletonFriendsList /> */}
    </div>
  );
}

export default ChatSideBar;
