"use server";
import crypto from 'crypto';
let authToken: string | null = null;
let isConnected = false;

export interface BackblazeFile {
    fileID: string;
    filename: string;
    publicURL: string;
}

export async function connectBackblaze() {
    if (isConnected == true) {
        return;
    }

    if(!process.env.BACKBLAZE_B2_APPLICATION_KEY_ID || !process.env.BACKBLAZE_B2_APPLICATION_KEY) {
        throw new Error("Backblaze env variables not set");
    }

    const baseAuth: string = `${process.env.BACKBLAZE_B2_APPLICATION_KEY_ID}:${process.env.BACKBLAZE_B2_APPLICATION_KEY}`;
    const response = await fetch("https://api005.backblazeb2.com/b2api/v3/b2_authorize_account", {
        headers: {
            "Authorization": `Basic ${btoa(baseAuth)}`
        }
    })
    const jsonData = await response.json();
    if (!(Object.keys(jsonData).includes("authorizationToken"))) {
        throw new Error(`Blackblaze authorization sent invalid response ${jsonData}`);
    }
    authToken = jsonData.authorizationToken;
    isConnected = true;
    console.log("CONNECTED TO BACKBLAZE");
}

export async function bb_uploadFile(filename: string, fileBuffer: Buffer): Promise<BackblazeFile> {
    await connectBackblaze();
    if(!authToken) {
        throw new Error("Backblaze Authorization Error");
    }

    let uploadURL: string|null = null;
    let uploadToken: string|null = null;
    let response = await fetch(`https://api005.backblazeb2.com/b2api/v3/b2_get_upload_url?bucketId=${process.env.BACKBLAZE_B2_BUCKET_ID}`, {
        headers: {
            "Authorization": authToken
        }
    })
    let jsonData = await response.json();
    if (Object.keys(jsonData).includes("uploadUrl")) {
        uploadURL = jsonData.uploadUrl;
        uploadToken = jsonData.authorizationToken;
    }

    if(!uploadURL || !uploadToken) {
        throw Error("Failed to obtain Backblaze upload URL and token");
    }

    response = await fetch(uploadURL, {
        method: "POST",
        headers: {
            "Authorization": uploadToken,
            "X-Bz-File-Name": encodeURIComponent(filename),
            "Content-Type": "b2/x-auto",
            "Content-Length": fileBuffer.length.toString(),
            "X-Bz-Content-Sha1": crypto.createHash('sha1').update(fileBuffer).digest('hex')
        },
        body: fileBuffer
    })
    jsonData = await response.json();
    const uploadedFile = {
        fileID: jsonData.fileId,
        filename: jsonData.fileName,
        publicURL: `https://${process.env.BACKBLAZE_S3_PUBLIC_DOMAIN}/${jsonData.fileName}`
    }
    console.log(`[BACKBLAZE] Uploaded file ${uploadedFile.filename} (${uploadedFile.publicURL})`);
    return uploadedFile;
}

export async function bb_deleteFile(file: BackblazeFile): Promise<void> {
    await connectBackblaze();
    if(!authToken) {
        throw new Error("Backblaze Authorization Error");
    }

    if(!process.env.BACKBLAZE_B2_BUCKET_ID) {
        throw new Error("B2 Bucket ID not set");
    }

    const response = await fetch(`https://api005.backblazeb2.com/b2api/v3/b2_delete_file_version`, {
        method: "POST",
        headers: {
            "Authorization": authToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fileName: file.filename,
            fileId: file.fileID
        })
    })
    if(response.status != 200) {
        console.log(`[BACKBLAZE] Failed to delete file: ${await response.json()}`);
        throw new Error("Failed to delete file");
    }
    console.log(`[BACKBLAZE] Deleted file ${file.filename}`);
}

