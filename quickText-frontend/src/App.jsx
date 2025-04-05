import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MessageProvider } from "./providers/Messages";

import NavBar from "./components/NavBar";
import Hero from "./components/Hero";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Chat from "./pages/Chat/Chat";
import ChatLayout from "./layouts/ChatLayout";

import { NotificationProvider } from "./providers/Notification";

import { SocketProvider } from "./providers/Socket";
import { UserProvider } from "./providers/User";
import Profile from "./pages/Profile/Profile";

function App() {
  const notifyMistakes = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const notifySuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <UserProvider>
      <NotificationProvider>
        <BrowserRouter>
          <ToastContainer />
          <div className="min-h-screen bg-base-200 font-outfit flex items-center flex-col overflow-hiddem pb-5">
            <Routes>
              <Route
                path="/"
                element={
                  <div className="">
                    <NavBar />
                    <Hero />
                  </div>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<ChatLayout />}>
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile/:id" element={<Profile />}></Route>
              </Route>
              <Route path="*" element={<h1>404 - Page Not Found</h1>} />
            </Routes>
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;
