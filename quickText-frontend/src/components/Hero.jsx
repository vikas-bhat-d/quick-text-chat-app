import React from 'react'
import {useNavigate } from 'react-router-dom'

function Hero() {
    const navigate=useNavigate();
    return (
        <div className='flex items-center'>
            <div className='h-full flex flex-col justify-center gap-5 items-center'>
                <h2 className='text-4xl font-bold text-text-purple'>
                    Connect Instantly,Chat Seamlessly with QuickText
                </h2>
                <p className='text-3xl'>
                    Real-time messaging,personalized chats, and easy connections all in one place
                </p>
                <div className='flex w-1/2 justify-center gap-24 '>
                    <button className='bg-button-purple text-white p-2 w-28 rounded-xl active:scale-90' onClick={(e)=>{navigate("/register")}}>Register</button>
                    <button className='text-button-purple p-2 w-28 border-2 border-button-purple rounded-xl  active:scale-90' onClick={(e)=>{navigate("/login")}}>Login</button>
                </div>
            </div>
            <div>
                <img src="/chat-illustration.svg" alt="" className='h-128' />
            </div>
        </div>
    )
}

export default Hero