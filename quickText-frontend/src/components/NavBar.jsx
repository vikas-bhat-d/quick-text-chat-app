import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../providers/User";
import { axiosInstance } from "../utils/axios";
// import { useNavigate } from "react-router-dom";
import { useNotification } from "../providers/Notification";

function NavBar() {
  const { user, setUser } = useUser();
  const { notifyMistakes, notifySuccess } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    async function call() {
      const respone = await axiosInstance.get("/user");
      setUser((prev) => respone.data);
    }
    if (!user) call();
  }, [user]);

  async function handleLogout() {
    try {
      const response = await axiosInstance.delete("/user/logout");
      console.log(response);
      if (response.status == 200) {
        setUser(null);
        notifySuccess("logged out");
        navigate("/");
      } else {
        notifyMistakes("failed to logout");
      }
    } catch (err) {
      notifyMistakes("failed to logout");
    }
  }
  return (
    <header className="w-screen min-h-16 flex items-center justify-between bg-base-300">
      <div className="ml-5 md:ml-52">
        <Link
          to="/"
          className="font-black text-md md:text-xl  flex items-center gap-2"
        >
          <div
            className="size-9 rounded-lg bg-primary/10 flex items-center justify-center"
            style={{ "--tw-bg-opacity": "0.5" }}
          >
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          QuickText<span className="text-xl md:text-2xl  z-10">.</span>
        </Link>
      </div>
      <div className="flex justify-between items-center gap-3 md:gap-5 mr-5 md:mr-52 p-2">
        <Link
          to="/settings"
          className="text-primary bg-primary/10 rounded-md text-sm flex justify-center items-center gap-1 p-2 "
        >
          <Settings size={18} />
          <p className="hidden md:block">Settings</p>
        </Link>
        {user ? (
          <>
            <button
              className="text-primary bg-primary/10 rounded-md text-sm flex justify-center items-center gap-1 p-2 "
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <p className="hidden md:block">LogOut</p>
            </button>

            <Link
              to="/profile/me"
              className="text-primary bg-primary/10 rounded-md text-sm flex justify-center items-center gap-1 p-2 "
            >
              <User size={18} />
              <p className="hidden md:block">Profile</p>
            </Link>
          </>
        ) : (
          ""
        )}
      </div>
    </header>
  );
}

export default NavBar;
