import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const SellerProtectedRoute = ({ children }) => {
  const { isLoading, isSeller } = useSelector((state) => state.seller);
  if (isLoading === false) {
    if (isSeller === false) {
      return <Navigate to="/login" replace />;
    }
    return children;
  }
};

export default SellerProtectedRoute;
