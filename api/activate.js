import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Only POST allowed" });
  }

  try {
    const body = req.body ? req.body : await new Promise(resolve => {
      let data = "";
      req.on("data", chunk => data += chunk);
      req.on("end", () => resolve(JSON.parse(data)));
    });

    const { key, deviceId } = body;

    if (!key || !deviceId) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
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
      return res.status(400).json({ success: false, message: "Invalid key" });
    }

    if (license.isUsed && license.deviceId !== deviceId) {
      return res.status(400).json({ success: false, message: "Key already used" });
    }

    if (!license.isUsed) {
      await supabase
        .from("licenses")
        .update({ isUsed: true, deviceId })
        .eq("key", key);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
