import { Client } from "minio";

// Internal client — server-to-server (upload, delete)
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER || "minioadmin",
  secretKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",
});

// Public client — generates browser-accessible presigned URLs
const publicMinioClient = new Client({
  endPoint: process.env.MINIO_PUBLIC_ENDPOINT || process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PUBLIC_PORT || "9010"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER || "minioadmin",
  secretKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",
});

const BUCKET = process.env.MINIO_BUCKET || "edu-platform";

async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET);
    await minioClient.setBucketPolicy(
      BUCKET,
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${BUCKET}/*`],
          },
        ],
      })
    );
  }
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  await ensureBucket();
  await minioClient.putObject(BUCKET, filename, buffer, buffer.length, {
    "Content-Type": contentType,
  });
  return filename;
}

export async function getFileUrl(filename: string): Promise<string> {
  return await publicMinioClient.presignedGetObject(BUCKET, filename, 7 * 24 * 60 * 60);
}

export async function deleteFile(filename: string): Promise<void> {
  await minioClient.removeObject(BUCKET, filename);
}

export { minioClient, BUCKET };
