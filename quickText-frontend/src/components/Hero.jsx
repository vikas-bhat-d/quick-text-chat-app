import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../providers/User";

function Hero() {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user]);

  return (
    <div className="flex flex-col-reverse md:flex-row items-center px-5 sm:px-8 md:px-16 lg:px-32">
      <div className="h-full flex flex-col justify-center gap-5 items-center">
        <h2 className="text-4xl font-bold text-primary">
          Connect Instantly,Chat Seamlessly with QuickText
        </h2>
        <p className="text-3xl">
          Real-time messaging,personalized chats, and easy connections all in
          one place
        </p>
        <div className="flex w-1/2 justify-center gap-24 ">
          <button
            className="btn btn-soft btn-primary"
            onClick={(e) => {
              navigate("/register");
            }}
          >
            Register
          </button>
          <button
            className="btn btn-outline btn-primary"
            onClick={(e) => {
              navigate("/login");
            }}
          >
            Login
          </button>
        </div>
      </div>
      <div>
        <img src="/chat-illustration.svg" alt="" className="h-128" />
      </div>
    </div>
  );
}

export default Hero;
