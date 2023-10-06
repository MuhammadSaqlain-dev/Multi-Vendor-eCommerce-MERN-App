import React, { useEffect } from "react";
import "./App.css";
import "tailwindcss/tailwind.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  LoginPage,
  SignUpPage,
  ActivationPage,
  HomePage,
  ProductsPage,
  EventsPage,
  FAQPage,
  BestSellingPage,
  ProductDetailsPage,
  CheckoutPage,
  PaymentPage,
  OrderSuccessPage,
  ProfilePage,
} from "./routes/Route.js";
import Store from "./redux/store";
import { loadUser } from "./redux/actions/userAction";
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  useEffect(() => {
    Store.dispatch(loadUser());
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/best-selling" element={<BestSellingPage />} />
        <Route exact path="/products" element={<ProductsPage />} />
        <Route exact path="/product/:name" element={<ProductDetailsPage />} />
        <Route exact path="/checkout" element={<CheckoutPage />} />
        <Route exact path="/payment" element={<PaymentPage />} />
        <Route exact path="/order/success/:id" element={<OrderSuccessPage />} />
        <Route exact path="/events" element={<EventsPage />} />
        <Route exact path="/faq" element={<FAQPage />} />
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/sign-up" element={<SignUpPage />} />
        <Route
          exact
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
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
