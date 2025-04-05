import React, { useState } from "react";
import axios from "axios";
import { server } from "../../assets/variables";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../providers/Notification";
import { useUser } from "../../providers/User";
import { Eye, EyeOff } from "lucide-react";
import NavBar from "../../components/NavBar";

function Login() {
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const { notifyMistakes, notifySuccess } = useNotification();

  const handleSubmit = async () => {
    let response = null;
    console.log("submitted");

    const data = { username, password };

    try {
      response = await axios.post(`${server}/api/v1/user/login`, data, {
        withCredentials: true,
      });
      console.log(response?.data);
      localStorage.setItem("accessToken", response?.data?.data?.accessToken);
      localStorage.setItem("refreshToken", response?.data?.data?.refreshToken);

      console.log("status:", response.status);
      if (response?.status == 200) {
        setUser((prev) => response.data.data[0]);
        notifySuccess("login succes");
        navigate("/chat");
      }
    } catch (error) {
      notifyMistakes(error?.response?.data?.message);
      console.log(error);
    }
  };

  return (
    <>
      <NavBar />
      <div className="h-full w-full  flex flex-col items-center justify-center pb-2 mt-4">
        <div
          className={`md:w-96 w-5/6 px-3 md:px-0 bg-base-100 rounded-lg shadow-lg flex items-center flex-col relative py-2 `}
        >
          <h2 className="text-2xl text-text-purple font-bold mb-5">
            Login Here
          </h2>
          <label className="input focus:outline-0 mb-5">
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
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </g>
            </svg>
            <input
              type="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username"
              pattern="[A-Za-z][A-Za-z0-9_\-]*"
              minLength="3"
              maxLength="30"
              title="Only letters, numbers or dash"
            />
          </label>

          <label className="input">
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
                <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
              </g>
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              minLength="8"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
            />

            {showPassword ? (
              <Eye
                onClick={() => {
                  setShowPassword((prev) => !prev);
                }}
              />
            ) : (
              <EyeOff
                onClick={() => {
                  setShowPassword((prev) => !prev);
                }}
              />
            )}
          </label>

          <button
            className="btn btn-primary btn-outline m-5"
            onClick={(e) => handleSubmit()}
          >
            Login
          </button>

          <p className="text-text-grey">
            New Here?{" "}
            <span
              className=" hover:cursor-pointer underline"
              onClick={() => {
                navigate("/register");
              }}
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
