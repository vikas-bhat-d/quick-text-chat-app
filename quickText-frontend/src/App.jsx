import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import NavBar from './components/NavBar'
import Hero from './components/Hero'
import Login from './components/Login'
import Register from './components/Register'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
        <div className=' w-screen h-screen bg-background-light px-32 pt-5  font-outfit flex items-center flex-col'>

      <Routes>
        <Route path='/' element={
          <>
          <NavBar />
          <Hero />
          </>
        }>
        </Route>
        <Route path='/login' element={<Login/>}>
        </Route>
        <Route path='/register' element={<Register/>}>

        </Route>
        
      </Routes>
          </div>
    </BrowserRouter>

  )
}

export default App
