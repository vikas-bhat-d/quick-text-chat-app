import React, { useEffect, useState, useRef, useCallback } from "react";
import { CircleCheck, Clock } from "lucide-react";
import NavBar from "../../components/NavBar";
import { useMessage } from "../../providers/Messages";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";
import { Camera } from "lucide-react";
import Cropper from "react-easy-crop";
import { TailSpin } from "react-loader-spinner";
import { useUser } from "../../providers/User";
import { useNotification } from "../../providers/Notification";

function Profile() {
  const {
    searchResult,
    setSearchResult,
    setSelectedChat,
    selectedChat,
    setIsChatSelected,
    friends,
    fetchRequests,
    friendRequests,
  } = useMessage();
  const { user, setUser } = useUser();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [blobImg, setBlobImg] = useState(null);
  const [showUpdateIcon, setShowUpdateIcon] = useState(false);
  const navigate = useNavigate();

  const { notifyMistakes, notifySuccess } = useNotification();

  const [friendStatus, setFriendStatus] = useState(null);

  const [profileUpdating, setProfileUpdating] = useState(false);

  const [profile, setProfile] = useState({});

  function getTimeAgo(date) {
    console.log(date);
    const now = Math.floor(Date.now() / 1000);

    console.log(new Date(Date.now()).toString());
    console.log("today date:=>", now);
    const timestamp = Math.floor(date.getTime() / 1000);
    const diff = now - timestamp;

    console.log("diff:", diff);

    if (diff < 60) return `${Math.round(diff)} seconds`;
    if (diff < 3600) return `${Math.round(diff / 60)} minutes`;
    if (diff < 86400) return `${Math.round(diff / 3600)} hours`;
    if (diff < 172800) return `yesterday`;
    return `${Math.round(diff / 86400)} days`;
  }

  useEffect(() => {
    async function call() {
      console.log("id: ", id);
      if (id.trim() != "me") {
        try {
          const response = await axiosInstance.get(`/user/id?id=${id}`);
          console.log(response.data.data);
          setProfile(response.data.data);
          setShowUpdateIcon(false);
        } catch (error) {
          navigate("/");
        }
      }
    }

    fetchRequests();
    call();
  }, [id]);

  useEffect(() => {
    const isFriend = friends.filter(
      (item) => item._id?.toString() == id?.toString()
    );
    console.log("isFriend", isFriend);

    const isRequestPending = friendRequests?.sentRequests?.filter(
      (item) => item.userTwo?.toString() == id?.toString()
    );

    const isRequestRecieved = friendRequests?.receivedRequests?.filter(
      (item) => item.userOne?.toString() == id?.toString()
    );

    console.log("is request recieved: ", isRequestRecieved);

    if (isFriend?.length == 1) {
      setFriendStatus(1);
    }
    if (isRequestPending?.length == 1) {
      setFriendStatus(0);
    }

    if (isRequestRecieved?.length == 1) {
      setFriendStatus(2);
    }
  }, [id, friends, friendRequests]);

  useEffect(() => {
    console.log("id: ", id.trim());
    if (id.trim() == "me" && user) {
      console.log("setting the current user for profile");
      setProfile(user);
      setImageSrc(user.profilePicture);
      setShowUpdateIcon(true);
    }
  }, [user, id]);

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
    const data = new FormData();
    data.append("displayPicture", blob, "display-picture.jpeg");
    setShowCropper(false);
    setProfileUpdating(true);
    const response = await axiosInstance.patch("/user/update", data);
    setProfileUpdating(false);
    console.log(response);
  };

  const sendFriendRequest = async (e) => {
    if (friendStatus == 1) return;
    const target = e.target;
    const prev = friendStatus;

    console.log(friendStatus);
    if (friendStatus != 2) {
      try {
        const data = {
          userTwo: profile?._id,
        };
        setFriendStatus(-1);
        target.style.pointerEvents = "none";

        const response = await axiosInstance.post("/friend", data);
        if (response.data.success) {
          console.log("setting state");
          setFriendStatus((prev) => 0);
          console.log("friendStatus:", friendStatus);
        } else {
          notifyMistakes("error in code");
          target.style.pointerEvents = "auto";
          setFriendStatus(prev);
        }
      } catch (error) {
        console.error(error);
        notifyMistakes(error?.response?.data?.message);
        target.style.pointerEvents = "auto";
        setFriendStatus(prev);
      }
    } else if (friendStatus == 2) {
      try {
        const data = {
          requesterId: id,
        };
        setFriendStatus(-1);
        target.style.pointerEvents = "none";

        const response = await axiosInstance.post("/friend/accept", data);
        if (response.data.success) {
          console.log("setting state");
          setFriendStatus((prev) => 1);
          console.log("friendStatus:", friendStatus);
        } else {
          notifyMistakes("error in code");
          target.style.pointerEvents = "auto";
          setFriendStatus(prev);
        }
      } catch (error) {
        console.error(error);
        notifyMistakes(error?.response?.data?.message);
        target.style.pointerEvents = "auto";
        setFriendStatus(prev);
      }
    }
  };

  return (
    <>
      <NavBar />
      <div className="m-auto w-5/6 max-w-96 h-96 bg-base-300 flex flex-col items-center ">
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
        <div className="relative my-2">
          {!profileUpdating ? (
            <img
              src={imageSrc || profile?.profilePicture}
              alt=""
              className="h-28 rounded-full border-4 border-base-100"
            />
          ) : (
            <div className="h-28 w-28 rounded-full border-4 border-base-100 flex items-center justify-center">
              <TailSpin
                visible={true}
                height="80"
                width="80"
                color="#4fa94d"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            </div>
          )}

          {showUpdateIcon && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                name="image"
                hidden
              />

              <div
                className="absolute right-1 bottom-0.5 bg-primary p-1 rounded-full"
                onClick={(e) => fileInputRef.current.click()}
              >
                <Camera className="size-5" />
              </div>
            </>
          )}
        </div>
        {id != "me" && (
          <div className="my-2 gap-5 flex ">
            <div
              className="btn btn-soft"
              onClick={() => {
                setSelectedChat((prev) => profile);
                setIsChatSelected(() => true);
                navigate("/chat");
              }}
            >
              Message
            </div>
            <div
              className={`btn btn-soft ${
                friendStatus == 1 || friendStatus == 2
                  ? "btn-success"
                  : "btn-primary"
              }`}
              onClick={(e) => {
                sendFriendRequest(e);
              }}
            >
              {friendStatus === 1 && (
                <>
                  <p>Friend</p>
                  <CircleCheck />
                </>
              )}

              {friendStatus === 0 && (
                <>
                  Pending <Clock />
                </>
              )}

              {friendStatus === -1 && (
                <>
                  <span
                    className="loader spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                </>
              )}

              {friendStatus === 2 && (
                <>
                  Accept <CircleCheck />
                </>
              )}

              {friendStatus === null && <p>Add Friend</p>}
            </div>
          </div>
        )}
        <label className="input input-primary focus:outline-0 mt-5 w-3/4">
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
            // className="input input-primary"
            value={`Username: ${profile?.username || ""}`}
            required
            placeholder="Username"
            pattern="[A-Za-z][A-Za-z0-9_\-]*"
            minLength="3"
            maxLength="30"
            title="Only letters, numbers or dash"
            // disabled
            readOnly
          />
        </label>
        <label className="input input-primary focus:outline-0 mt-5 w-3/4">
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
            value={`Email: ${profile?.email || ""}`}
            readOnly
          />
        </label>
        <div className="member-since text-base-content text-md mt-5 border-t-2 w-3/4 border-base-100 flex gap-2">
          Member Since:{" "}
          <p>{profile ? getTimeAgo(new Date(profile?.createdAt)) : ""}</p>
        </div>
      </div>
    </>
  );
}

export default Profile;
