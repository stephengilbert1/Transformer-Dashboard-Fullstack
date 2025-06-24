import fs from "fs";
import path from "path";

// Load JSON
const input = JSON.parse(fs.readFileSync("./output/XFMR-2180.json", "utf-8"));

const transformerId = input.id;
const rows = input.temperatureHistory.map((entry) => {
  return `${transformerId},${entry.timestamp},${entry.tempC}`;
});

const header = "transformer_id,timestamp,tempC";
const csv = [header, ...rows].join("\n");

// Write CSV
fs.writeFileSync("./output/temperature_readings.csv", csv);
console.log("✅ CSV written to ./output/temperature_readings.csv");
