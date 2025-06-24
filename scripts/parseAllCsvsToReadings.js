import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

const inputDir = "./src/data";
const outputFile = "./output/temperature_readings.csv";

const readings = [];
const now = new Date();
const cutoffDate = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000); // 35 days ago

const files = fs.readdirSync(inputDir).filter((f) => f.endsWith(".csv"));

let filesProcessed = 0;

files.forEach((file) => {
  const transformerId = path.basename(file, ".csv"); // assumes filename = XFMR-XXXX.csv
  const fullPath = path.join(inputDir, file);

  fs.createReadStream(fullPath)
    .pipe(csv())
    .on("data", (row) => {
      try {
        const rawTime = row["Start Time"]?.replace(/ PDT/, "");
        // Dynamically find the first matching sensor column
        const keys = Object.keys(row);
        const sensorTempKey = keys.find(
          (key) =>
            key.includes("Average (Deg C)") && !key.startsWith("Ambient") && !key.includes("CPU")
        );

        if (!sensorTempKey) {
          console.warn(`⚠️ No usable temperature column found in ${file}`);
          return;
        }

        const temp = parseFloat(row[sensorTempKey]);

        if (!rawTime || isNaN(temp)) return;

        const parsed = parse(rawTime, "MMM dd HH:mm:ss xxxx yyyy", new Date());
        const utc = fromZonedTime(parsed, "America/Los_Angeles");

        if (utc >= cutoffDate) {
          readings.push({
            transformer_id: transformerId,
            timestamp: utc.toISOString(),
            tempC: temp,
          });
        }
      } catch (err) {
        console.warn(`❌ Error in ${file}:`, err.message);
      }
    })
    .on("end", () => {
      filesProcessed++;
      if (filesProcessed === files.length) {
        // Once all files are done, write combined CSV
        // const header = "transformer_id,timestamp,tempC";
        // const lines = readings.map((r) => `${r.transformer_id},${r.timestamp},${r.tempC}`);
        // // Write combined CSV
        // fs.writeFileSync(outputFile, [header, ...lines].join("\n"));
        // console.log(
        //   `✅ Done. Wrote ${readings.length} readings from ${files.length} transformers to ${outputFile}`
        // );

        // 🔁 Split readings by transformer
        const grouped = {};
        readings.forEach((r) => {
          if (!grouped[r.transformer_id]) grouped[r.transformer_id] = [];
          grouped[r.transformer_id].push(`${r.transformer_id},${r.timestamp},${r.tempC}`);
        });

        // 📝 Write one CSV per transformer
        for (const id in grouped) {
          const splitHeader = "timestamp,tempC";
          const content = [splitHeader, ...grouped[id]].join("\n");
          fs.writeFileSync(`./output/${id}.csv`, content);
          console.log(`📄 Wrote ./output/${id}.csv (${grouped[id].length} rows)`);
        }
      }
    });
});
