import React, { useCallback, useRef, useState } from 'react'
import Cropper from 'react-easy-crop';
import axios from 'axios';


function Register() {
  const [imageSrc, setImageSrc] = useState("/user.png");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [showCropper, setShowCropper] = useState(false);
  
  const [blobImg,setBlobImg]=useState(null);
  const [username, setUsername] = useState("");
  const fileInputRef = useRef(null)
  const [email, setEmail] = useState("");
  const [password,setPassword]=useState("")
  const [confirmPassword,setConfirmPassword]=useState("")

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result)
        console.log("file changed")
        setShowCropper(true)
      };
      reader.readAsDataURL(file);
    }
  }

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    console.log(croppedAreaPixels);
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const generateCroppedImage = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas')
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
        )
        canvas.toBlob((blob) => {
          const previewUrl = URL.createObjectURL(blob);
          console.log(blob)
          resolve({ blob, previewUrl });
        }, "image/jpeg");
      };
    })
  }

  const handlePreview = async () => {
    const { blob, previewUrl } = await generateCroppedImage();
    setImageSrc(previewUrl);
    setBlobImg(blob)
    setShowCropper(false);
  }

  const handleSubmit=async()=>{
    console.log("submitted")
    if(password!==confirmPassword) return
    const data=new FormData()
    data.append('username',username);
    data.append('email',email);
    if(blobImg)
      data.append('displayPicture',blobImg,'display-picture.jpeg');
    data.append('password',password)

    for(let [key,value] of data.entries())
      console.log(`${key}:${value}`)
  }

  return (
    <div className='h-full w-full flex items-center justify-center'>
      <div className={`w-96 bg-white rounded-lg shadow-lg p-8 flex items-center flex-col relative`}>
        {showCropper && (
          <div className='h-full w-full absolute z-10 top-0 backdrop-blur-md '>
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
            <button onClick={handlePreview} className='absolute bg-green-500 text-white p-2 text-sm w-28 rounded-xl active:scale-90 z-20 transform -translate-x-1/2 -translate-y-1/2 inset-x-1/2 bottom-10'>OK</button>
          </div>
        )}
        <h2 className='text-2xl text-text-purple font-bold mb-5'>Create Account</h2>
        <div className=''>
          <img src={imageSrc} alt="" className='h-32 w-32  rounded-full object-cover ' />
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} name='image' hidden />

        <button onClick={(e) => fileInputRef.current.click()} className='bg-button-purple text-white m-2 text-sm p-2 w-32 rounded-xl active:scale-90'>Change Picture</button>

        <input type='email' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='enter username' name='username' className='border border-text-grey rounded-md px-2 py-2 focus:outline-none mb-5' />

        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='enter email' name='email' className='border border-text-grey rounded-md px-2 py-2 focus:outline-none mb-5' />

        <input type="password"  value={password} onChange={(e)=>setPassword(e.target.value)} placeholder='enter password' name='password' className='border border-text-grey rounded-md px-2 py-2 focus:outline-none mb-5'/>

        <input type="password"  value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder='confirm password' name='password' className='border border-text-grey rounded-md px-2 py-2 focus:outline-none mb-5'/>

        <button className='bg-button-purple text-white m-2 text-sm p-2 w-32 rounded-xl active:scale-90' onClick={e=>handleSubmit()}>Register</button>


      </div>
    </div>
  )
}

export default Register