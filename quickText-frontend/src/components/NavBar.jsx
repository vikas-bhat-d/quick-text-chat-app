import React from 'react'

function NavBar() {
    return (
        <div className='w-full h-16 flex justify-between '>
            <div>
                <p className='text-lg font-black text-midnight-purple text-4xl'>QuickText<span className="text-2xl">.</span></p>
            </div>
            <div className='text-text-grey font-medium text-xl flex flex-row justify-between gap-5'>
                <p>Home</p>
                <p>About</p>
                <p>Features</p>
                <p>Contact</p>
            </div>

        </div>
    )
}

export default NavBar