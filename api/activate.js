import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: "edge"
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, message: "Only POST allowed" }),
      { status: 405 }
    );
  }

  const { key, deviceId } = await req.json();

  if (!key || !deviceId) {
    return new Response(
      JSON.stringify({ success: false, message: "Missing parameters" }),
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: license, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("key", key)
    .single();

  if (error || !license) {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid key" }),
      { status: 400 }
    );
  }

  if (license.isUsed && license.deviceId !== deviceId) {
    return new Response(
      JSON.stringify({ success: false, message: "Key already used" }),
      { status: 400 }
    );
  }

  if (!license.isUsed) {
    await supabase
      .from("licenses")
      .update({ isUsed: true, deviceId })
      .eq("key", key);
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
