export async function GET() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
      method: "GET",
    });
    return Response.json({ status: "pinged" });
  } catch {
    return Response.json({ status: "failed" });
  }
}