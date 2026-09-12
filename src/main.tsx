import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { createBrowserRouter, RouterProvider } from "react-router";
import Body from './Body';
import About from './About';
import Login from './Login';
import Error from './Error';


const approuter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Body />,
      },
        {
        path: "/about",
        element: <About />,
      },
        {
        path: "/login",
        element: <Login />,
      },
    ],
    errorElement:<Error />
  }
])
createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <RouterProvider router={approuter} />
  </StrictMode>,
)
