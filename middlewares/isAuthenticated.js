import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user access",
      });
    }
    const decode =  jwt.verify(token, process.env.SECRET_TOKEN);

    if (!decode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user access",
      });
    }
    req.userId = decode.userId;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
