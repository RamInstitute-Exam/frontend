import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify'
import { BrowserRouter } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import React from 'react'
const ResponsiveToastContainer = () => {
  const [position, setPosition] = React.useState('top-right');

  React.useEffect(() => {
    function updatePos()
    {
      if (window.innerWidth < 640) {
        setPosition('top-center');
      } else {
        setPosition('top-right');
      }
    }
    updatePos();
    window.addEventListener('resize', updatePos);
    return () => window.removeEventListener('resize', updatePos);
  }, []);

  return (
    <ToastContainer
      position={position}
      autoClose={500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnHover
      draggable
      theme='colored'
    />
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <ResponsiveToastContainer />
    </BrowserRouter>
  </StrictMode>,
);
