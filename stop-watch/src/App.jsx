import React, { useEffect } from 'react'
import { BrowserRouter,Routes,Route} from 'react-router-dom'
import Stopwatch from './StopWatch'
import Settings from './pages/Settings'
import MainLayout from './components/MainLayout'
import AddUser from './pages/AddUser'
import { ThemeProvider } from './context/ThemeContext'
import AllUser from './pages/AllUser'
import Login from './pages/Login'
import { useGetMeQuery } from './redux/userApi'
import { useDispatch } from 'react-redux'
import { setUser } from './redux/authSlice';
import PrivateRoute from './pages/PrivateRoute'
import { ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import RoleRoute from './pages/RoleRoute'
import ChatPage from './pages/ChatPage'


const App = () => {
const dispatch = useDispatch();
const { data , isLoading} = useGetMeQuery();

useEffect(() => {
  if(data){
    dispatch(setUser(data));
  }
},[data , dispatch]);

if(isLoading) return <p>...Loading</p>

  return (
    <ThemeProvider>
      <ToastContainer position="top-right" autoClose={3000} />
   <BrowserRouter>
      <Routes>

        {/* Dashboard Layout */}
        <Route path="/dashboard" 
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route index
           element={ 
           <RoleRoute allowedRoles={["superadmin" , "admin","staff"]}>
              <AddUser />
           </RoleRoute>}  />
          <Route path="alluser" element={<AllUser />} />

         <Route
  path="chatpage"
  element={
    <RoleRoute allowedRoles={["superadmin", "admin", "staff", "student"]}>
      <ChatPage />
    </RoleRoute>
  }
/>
          <Route path="settings" element={<Settings />} />
           </Route>

        {/* Separate page */}
        <Route path="/stopwatch" element={<Stopwatch />} />
        <Route path='/login' element={<Login />} />
        
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  )
}

export default App