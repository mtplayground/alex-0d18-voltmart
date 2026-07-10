import { NextResponse } from "next/server";

import { getSignedObjectUrl } from "@/lib/object-storage";

type ImageRouteProps = Readonly<{
  params: Promise<{
    key: string[];
  }>;
}>;

export async function GET(_request: Request, { params }: ImageRouteProps) {
  const { key } = await params;
  const relativeKey = key.join("/");

  try {
    const signedUrl = await getSignedObjectUrl(relativeKey);

    return NextResponse.redirect(signedUrl, 307);
  } catch (error) {
    console.error("Image signing failed", error);
    return new NextResponse("Image not available", { status: 404 });
  }
}
