import axios from "axios";
import { server } from "../../server";

// load Shop
export const loadShop = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadSellerRequest" });
    const { data } = await axios.get(`${server}/shop/getshop`, {
      withCredentials: true,
    });

    dispatch({ type: "LoadSellerSuccess", payload: data.seller });
  } catch (error) {
    dispatch({ type: "LoadSellerFail", payload: error.response.data.message });
  }
};
