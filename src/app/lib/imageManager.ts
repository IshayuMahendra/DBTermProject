import imageType from "image-type";
import { BackblazeFile, bb_uploadFile } from "./backblaze";
import sharp from "sharp";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

export async function processAndUploadImage(image: FormDataEntryValue): Promise<BackblazeFile> {
    if (!(image instanceof Blob)) {
        throw new Error("Provided image was not a valid image file");
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    //If file is not an image
    if (!(await imageType(buffer))) {
        throw new Error("Provided upload was not an image file.");
    }

    if (buffer.length == 0) {
        throw new Error("Image provided was blank.");
    }

    const resizedImageBuffer: Buffer = await sharp(buffer).resize(1000).toBuffer();

    const imgExtension = path.extname(image.name);
    const filename = `${uuidv4()}${imgExtension}`;
    const uploadedImage = await bb_uploadFile(filename, resizedImageBuffer);
    return uploadedImage;
}