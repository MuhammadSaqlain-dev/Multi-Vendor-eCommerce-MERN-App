import React, { useEffect } from "react";
import "./App.css";
import "tailwindcss/tailwind.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { LoginPage, SignUpPage, ActivationPage } from "./routes/Route.js";
import axios from "axios";
import { server } from "./server";

const App = () => {
  useEffect(() => {
    try {
      axios
        .get(`${server}/user/getuser`, { withCredentials: true })
        .then((res) => toast.success(res.data.message))
        .catch((e) => toast.error(e.response.data.message));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/sign-up" element={<SignUpPage />} />
        <Route
          exact
          path="/activate/:activation_token"
          element={<ActivationPage />}
        />
      </Routes>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
};

export default App;
