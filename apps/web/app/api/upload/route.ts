import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

import { s3, BUCKET_NAME } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "photos";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${folder}/${uuidv4()}-${file.name}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    return NextResponse.json({
      data: `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as any).message },
      { status: 500 },
    );
  }
}
