import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloud } from "../utils/Cloudnary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation  --notempty
  //check if user already exists (username ,email)
  //check for images, check for avatar
  //upload them to cloudinary
  //create user object =create entry in db
  //check for user creation
  //return response

  const { fullName, email, username, password } = req.body;

  if (fullName === "") {
    throw new ApiError(400, "Full Name is required!");
  }

  if (email === "") {
    throw new ApiError(400, "Email is required!");
  }

  if (username === "") {
    throw new ApiError(400, "User Name is required!");
  }
  if (password === "") {
    throw new ApiError(400, "Password is required!");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverimgLocalPath = req.files?.coverImage[0]?.path;

  let coverimgLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverimgLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required!");
  }

  const avatar = await uploadOnCloud(avatarLocalPath);
  const coverImage = await uploadOnCloud(coverimgLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required!");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering!!");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
