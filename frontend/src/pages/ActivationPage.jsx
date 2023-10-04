import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { server } from "../server";

const ActivationPage = () => {
  const { activation_token } = useParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (activation_token) {
      const sendResponse = async () => {
        await axios
          .post(`${server}/user/activation`, { activation_token })
          .then((res) => {
            toast.success("Account created sucessfully");
          })
          .catch((err) => {
            setError(true);
          });
      };

      sendResponse();
    }
  }, [activation_token]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {error ? (
        <p>Your Token has been expired! try again</p>
      ) : (
        <p>Your account has been created successfully.</p>
      )}
    </div>
  );
};

export default ActivationPage;
