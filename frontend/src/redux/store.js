import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/userReducer";
import { sellerReducer } from "./reducers/sellerReducer";
import { productReducer } from "./reducers/productReducer";
import { eventReducer } from "./reducers/eventReducer";
import { cartReducer } from "./reducers/cartReducer";
import { wishlistReducer } from "./reducers/wishlistReducer";
import { orderReducer } from "./reducers/orderReducer";

const Store = configureStore({
  reducer: {
    user: userReducer,
    seller: sellerReducer,
    products: productReducer,
    events: eventReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
  },
});

export default Store;
