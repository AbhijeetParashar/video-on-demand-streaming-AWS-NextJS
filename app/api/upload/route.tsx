import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

// Configure AWS SDK
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_S3_SOURCE_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_SOURCE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SOURCE_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  try {
    // Send response with file names and signed URLs
    return NextResponse.json({ msg: "Hello GET" });
  } catch (error) {
    console.error(
      "Error fetching files from S3 or generating signed URLs:",
      error
    );
    return NextResponse.json({ error: "Error fetching." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file: any = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File is required", status: 400 });
    }

    const buffer = Buffer.from(await file?.arrayBuffer());
    const fileName = await uploadFileToS3(buffer, file.name);
    return NextResponse.json({
      ok: true,
      success: true,
      status: 200,
      msg: "File Uploaded Successfully..!!",
      fileName,
    });
  } catch (error) {
    console.error(
      "Error fetching files from S3 or generating signed URLs:",
      error
    );
    return NextResponse.json(
      { error: "Error Uploading File." },
      { status: 500 }
    );
  }
}
async function uploadFileToS3(buffer: Buffer, filename: any) {
  const params = {
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_SOURCE_BUCKET_NAME,
    Key: `${filename}-${Date.now()}`,
    Body: buffer,
    ContentType: "video/*",
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  return filename;
}
