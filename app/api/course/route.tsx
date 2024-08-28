import { getSignedUrl } from "@aws-sdk/cloudfront-signer"; // Import your signing function
import AWS from "aws-sdk";
import { NextRequest, NextResponse } from "next/server";

interface S3File {
  Key: string;
  LastModified: Date;
  ETag: string;
  Size: number;
  StorageClass: string;
  ChecksumAlgorithm: string[];
}

interface OrganizedContent {
  id: string;
  title: string;
  mainM3U8: string | null;
  resolutions: { [resolution: string]: string }; // resolution -> m3u8 file
  thumbnails: string[];
  mp4: string | null;
}

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_DESTINATION_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_DESTINATION_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_S3_DESTINATION_REGION,
});

const s3 = new AWS.S3();

export async function GET(req: NextRequest) {
  try {
    // Fetch files from S3 bucket
    const bucketParams = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_DESTINATION_BUCKET_NAME!,
    };

    const data = await s3.listObjectsV2(bucketParams).promise();
    const s3Files: any = data.Contents;

    if (!s3Files || s3Files.length === 0) {
      return NextResponse.json(
        { message: "No files found in the bucket." },
        { status: 200 }
      );
    }

    // Define CloudFront credentials
    const privateKey = process.env.NEXT_PUBLIC_CLOUDFRONT_PRIVATE_KEY!;
    const keyPairId = process.env.NEXT_PUBLIC_CLOUDFRONT_KEY_PAIR_ID!;
    const cloudFrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL!;

    const organizedContent = organizeS3Data(
      s3Files,
      cloudFrontUrl,
      keyPairId,
      privateKey
    );
    console.log("organizedContent", organizedContent);
    // Send response with file names and signed URLs
    return NextResponse.json(organizedContent, { status: 200 });
  } catch (error) {
    console.error(
      "Error fetching files from S3 or generating signed URLs:",
      error
    );
    return NextResponse.json(
      { error: "Error fetching files from S3 or generating signed URLs." },
      { status: 500 }
    );
  }
}

function generateSignedUrl(
  fileKey: string,
  cloudFrontUrl: string,
  keyPairId: string,
  privateKey: string
): string {
  const url = `${cloudFrontUrl}/${fileKey}`;

  // Set expiration time for 1 minute from the current time
  const dateLessThan = new Date();
  dateLessThan.setMinutes(dateLessThan.getMinutes() + 60);

  return getSignedUrl({
    url,
    keyPairId,
    privateKey,
    dateLessThan: dateLessThan.toISOString(),
  });
}

function organizeS3Data(
  data: S3File[],
  cloudFrontUrl: string,
  keyPairId: string,
  privateKey: string
): OrganizedContent[] {
  const organizedData: { [id: string]: OrganizedContent } = {};

  data.forEach((file) => {
    // Extract the unique identifier for each content
    const pathParts = file.Key.split("/");
    const contentId = pathParts[1]; // Assuming the ID is always in the second position
    const fileName = pathParts[pathParts.length - 1]; // Get the last part of the path as the file name
    const title = fileName.split(".")[0];

    if (!organizedData[contentId]) {
      organizedData[contentId] = {
        id: contentId,
        title: title,
        mainM3U8: null,
        resolutions: {},
        thumbnails: [],
        mp4: null,
      };
    }

    // Generate the signed URL for the file
    const signedUrl = generateSignedUrl(
      file.Key,
      cloudFrontUrl,
      keyPairId,
      privateKey
    );

    // Determine the type of file and assign it to the appropriate place
    if (file.Key.endsWith(".m3u8")) {
      if (file.Key.includes("HLS/") && !file.Key.match(/_\d{3,4}\.m3u8$/)) {
        // Main m3u8 file
        organizedData[contentId].mainM3U8 = signedUrl;
      } else {
        // Resolution-specific m3u8 files
        const resolutionMatch = file.Key.match(/_(\d{3,4})\.m3u8$/);
        if (resolutionMatch) {
          const resolution = resolutionMatch[1];
          organizedData[contentId].resolutions[resolution] = signedUrl;
        }
      }
    } else if (file.Key.endsWith(".jpg")) {
      // Thumbnail files
      organizedData[contentId].thumbnails.push(signedUrl);
    } else if (file.Key.endsWith(".mp4")) {
      // MP4 files
      organizedData[contentId].mp4 = signedUrl;
    }
  });

  // Convert organizedData from an object to an array
  return Object.values(organizedData);
}
