import { v2 as cloudnary } from "cloudinary";
import fs from "fs";

cloudnary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloud = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudnary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    ///file has been uploaded susccessfully

    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload opration got failed
    return null;
  }
};

export { uploadOnCloud };
