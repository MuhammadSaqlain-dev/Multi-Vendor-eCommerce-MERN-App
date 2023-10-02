import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/userReducer";

const Store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default Store;
