import { pinata } from "@/utils/pinataConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const options = {
      metadata: {
        name: data.name,
      },
    };
    const uploadData = await pinata.upload.json(data, options);
    return NextResponse.json(uploadData, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
