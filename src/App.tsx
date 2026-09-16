import { Outlet } from "react-router"
import {Navbar} from "./components/Navbar"
import { Footer } from "./components/Footer"
import axios from "axios";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { addUser } from "./utils/userslice";
import { useNavigate } from "react-router";
const App = () => {
  const dispatch=useDispatch();
  const navigate=useNavigate();
  useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Ask the backend to verify the cookie and return the user profile
                const response = await axios.get("http://localhost:3000/profile", {
                    withCredentials: true
                });
                
                // If successful, the cookie is valid! Save the user to Redux.
                dispatch(addUser(response.data));
                
                // (Optional) If they happen to be on the login page, redirect them to the feed
                if (window.location.pathname === '/login') {
                    navigate("/");
                }
                
            } catch (error) {
                // If it fails (cookie is missing, expired, or invalid), they are not logged in.
                // Kick them to the login page so they can authenticate.
                if (window.location.pathname !== '/login') {
                     navigate("/login");
                }
            }
        };

        fetchUserProfile();
    }, [dispatch]);


  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="flex-1 pt-20 pb-10 px-4 sm:px-6 w-full max-w-7xl mx-auto flex flex-col items-center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
