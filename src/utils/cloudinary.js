import cloudinary from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const saveToCloud = async (image, parentFolder, userFolderId) => {
    const b64 = Buffer.from(image.buffer).toString('base64');
    let dataURI = "data:" + image.mimetype + ";base64," + b64;
    const res = await cloudinary.v2.uploader.upload(dataURI, {
        folder: `${parentFolder}/${userFolderId}`,
    });
    return res.url;
}

const multipleImageUpload = async (images, parentFolder, userFolderId) => {
    if (!Array.isArray(images)) {
        throw new Error("Images must be an array");
    }
    const uploadPromises = images.map(async (image) => {
        const b64 = Buffer.from(image.buffer).toString('base64');
        let dataURI = "data:" + image.mimetype + ";base64," + b64;
        const res = await cloudinary.v2.uploader.upload(dataURI, {
            folder: `${parentFolder}/${userFolderId}`,
        });
        return res.url;
    });
    const uploadedImageUrls = await Promise.all(uploadPromises);
    return uploadedImageUrls;
};

export { saveToCloud, multipleImageUpload };