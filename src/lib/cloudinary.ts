import { v2 as cloudinary } from "cloudinary"

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  console.error("[Cloudinary] Missing credentials:", {
    cloud_name: !!cloudName,
    api_key: !!apiKey,
    api_secret: !!apiSecret,
  })
} else {
  console.log("[Cloudinary] Config initialized for cloud:", cloudName)
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

export async function uploadImage(
  buffer: Buffer,
  folder: string
): Promise<{ url: string; public_id: string; width: number; height: number }> {
  console.log("[Cloudinary] Starting upload to folder:", folder, "buffer size:", buffer.length)
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        format: "webp",
        quality: "85",
        transformation: [{ width: 1920, crop: "limit" }],
      },
      (error, result) => {
        if (error || !result) {
          console.error("[Cloudinary] Upload error:", error)
          reject(error ?? new Error("Upload failed"))
          return
        }
        console.log("[Cloudinary] Upload success:", result.secure_url)
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
        })
      }
    )
    uploadStream.end(buffer)
  })
}

export async function deleteImage(public_id: string): Promise<void> {
  console.log("[Cloudinary] Deleting image:", public_id)
  await cloudinary.uploader.destroy(public_id)
  console.log("[Cloudinary] Delete success:", public_id)
}
