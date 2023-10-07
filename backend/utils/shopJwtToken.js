// create token and saving that in cookies
const sendShopToken = (shop, statusCode, res) => {
  const token = shop.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  return res.status(statusCode).cookie("seller_token", token, options).json({
    success: true,
    shop,
    token,
  });
};

module.exports = sendShopToken;
