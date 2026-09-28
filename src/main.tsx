import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { createBrowserRouter, RouterProvider } from "react-router";
import About from './components/About';
import Login from './components/Login_Signup';
import Error from './components/Error';
import { Provider } from 'react-redux';
import {store} from "./utils/store"
import Feed from './components/Feed';
import ProfileEdit from './components/Profile_edit';
import ConnectionRequests from './components/Connectionrequest';
import Connections from './components/Connections';

const approuter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Feed />,
      },
        {
        path: "/about",
        element: <About />,
      },
        {
        path: "/login",
        element: <Login />,
      },
      {
        path:"/profileedit",
        element:<ProfileEdit />
      },
      {
        path:"/connectionrequests",
        element:<ConnectionRequests />
      },
      {
        path:"/connections",
        element:<Connections />
      }
    ],
    errorElement:<Error />
  }
])
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <StrictMode>
      <RouterProvider router={approuter} />
  </StrictMode>
  </Provider>
)
