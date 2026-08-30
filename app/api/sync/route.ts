export async function POST() {
  return Response.json(
    { error: "Google write-sync is retired. Subscribe to your calendar URL instead." },
    { status: 410 },
  );
}
