import { pinata } from "@/utils/pinataConfig";
import { NextRequest, NextResponse } from "next/server";
import { FileObject } from "pinata";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const file: FileObject | null = data.get("file") as unknown as FileObject;
    const options = {
      metadata: {
        name: file.name,
      },
    };
    const uploadData = await pinata.upload.file(file, options);
    return NextResponse.json(uploadData, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    const CID = url.searchParams.get("CID") as string;

    const response = await pinata.gateways.get(CID);
    return NextResponse.json(response);
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
