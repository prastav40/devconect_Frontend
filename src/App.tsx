import { Outlet } from "react-router"
import {Navbar} from "./components/Navbar"
import { Footer } from "./components/Footer"
const App = () => {
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
