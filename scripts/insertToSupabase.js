import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load Supabase credentials from .env or insert them directly here
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Load JSON seed file
const data = JSON.parse(fs.readFileSync("./output/XFMR-2180.json", "utf-8"));

async function insertData() {
  const { error } = await supabase.from("transformers").insert([data]);
  if (error) {
    console.error("❌ Insert failed:", error.message);
  } else {
    console.log("✅ Transformer inserted");
  }
}

insertData();
