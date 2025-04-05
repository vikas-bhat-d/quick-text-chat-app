import React, { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { server } from "../../assets/variables";
import { useNotification } from "../../providers/Notification";
import { Eye, EyeOff } from "lucide-react";
import NavBar from "../../components/NavBar";

function Register() {
  const [imageSrc, setImageSrc] = useState("/user.png");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [blobImg, setBlobImg] = useState(null);
  const [username, setUsername] = useState("");
  const fileInputRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { notifyMistakes, notifySuccess } = useNotification();

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
        console.log("file changed");
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    console.log(croppedAreaPixels);
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const generateCroppedImage = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );
        canvas.toBlob((blob) => {
          const previewUrl = URL.createObjectURL(blob);
          console.log(blob);
          resolve({ blob, previewUrl });
        }, "image/jpeg");
      };
    });
  };

  const handlePreview = async () => {
    const { blob, previewUrl } = await generateCroppedImage();
    setImageSrc(previewUrl);
    setBlobImg(blob);
    setShowCropper(false);
  };

  const handleSubmit = async () => {
    let response = null;
    console.log("submitted");

    console.log(password, confirmPassword);

    if (password !== confirmPassword) {
      notifyMistakes("passwords do not match");
      return;
    }
    const data = new FormData();
    data.append("username", username);
    data.append("email", email);
    if (blobImg) data.append("displayPicture", blobImg, "display-picture.jpeg");
    data.append("password", password);

    try {
      response = await axios.post(`${server}/api/v1/user/register`, data);
      console.log(response?.data);
      console.log("status:", response.status);
      if (response?.status == 200) {
        notifySuccess("registration succes");
        navigate("/login");
      }
    } catch (error) {
      console.log(response?.status);
      notifyMistakes(error?.response?.data?.message);
      console.log(error);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-start sm:px-8 md:px-16 lg:px-32 overflow-x-hidden overflow-y-scroll scrollbar-hide">
      <NavBar />
      <div
        className={`w-96 bg-base-100 rounded-lg shadow-lg p-8 flex items-center flex-col relative mb-8 `}
      >
        {showCropper && (
          <div className="h-full w-full absolute z-10 top-0 backdrop-blur-md ">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { borderRadius: "8px" },
              }}
            />
            <button
              onClick={handlePreview}
              className="absolute bg-green-500 text-white p-2 text-sm w-28 rounded-xl active:scale-90 z-20 transform -translate-x-1/2 -translate-y-1/2 inset-x-1/2 bottom-10"
            >
              OK
            </button>
          </div>
        )}
        <h2 className="text-2xl text-text-purple font-bold mb-5">
          Create Account
        </h2>
        <div className="">
          <img
            src={imageSrc}
            alt=""
            className="h-32 w-32  rounded-full object-cover "
          />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          name="image"
          hidden
        />

        <button
          onClick={(e) => fileInputRef.current.click()}
          className="btn btn-primary btn-outline m-3"
        >
          Change Picture
        </button>

        {/* username  */}
        <label className="input validator focus:outline-0 mb-5">
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

        {/* email */}

        <label className="input validator mb-5">
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
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </g>
          </svg>
          <input
            type="email"
            placeholder="mail@site.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {/* password */}
        <label className="input validator">
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
        <p className="validator-hint hidden">
          Must be more than 8 characters, including
          <br />
          At least one number
          <br />
          At least one lowercase letter
          <br />
          At least one uppercase letter
        </p>

        <label className="input validator mt-5 mb-5">
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm Password"
            minLength="8"
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
          />
        </label>

        <button
          // className="bg-button-purple text-white m-2 text-sm p-2 w-32 rounded-xl active:scale-90"
          className="btn btn-primary mb-5"
          onClick={(e) => handleSubmit()}
        >
          Register
        </button>

        <p className="text-text-grey">
          Already Registered?{" "}
          <span
            className="hover:cursor-pointer underline"
            onClick={() => {
              navigate("/login");
            }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
