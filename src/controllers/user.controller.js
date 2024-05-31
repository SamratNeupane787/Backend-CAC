import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloud } from "../utils/Cloudnary.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const generateAccessAndRefereshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refereshToken = user.generateRefreshToken();

    user.refereshToken = refereshToken;
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token!"
    );
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  //let username email(req.body -> data )
  //username or email
  //find the user
  //password check
  //access and refresh token generate
  //send cookies

  const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User doesnot exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid Password");
  }

  const { accessToken, refereshToken } = await generateAccessAndRefereshToken(
    user._id
  );

  const LoggedInuser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accesssToken", accessToken, options)
    .cookie("refreshToken", refereshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: LoggedInuser,
          accessToken,
          refereshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refereshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refereshToken")
    .json(new ApiResponse(200, {}, "Logged out successfully!"));
});

export { registerUser, loginUser, logoutUser };
