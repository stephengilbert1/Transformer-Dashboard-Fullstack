const fs = require("fs");
const csv = require("csv-parser");
const { parse } = require("date-fns");
const { fromZonedTime } = require("date-fns-tz");

const filePath = "./src/data/0002180-91 Virginia Place-1ØPd-75kVA-StdLd-Mdl 7131.csv"; // path to your csv file
const transformerId = "XFMR-2180";

const temperatureHistory = [];

fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (row) => {
    try {
      const rawTime = row["Start Time"].replace(/ PDT/, ""); // safely removes ' PDT'

      const rawTemp = row["0001583 (ID#1532162) Average (Deg C)"];

      if (!rawTime || !rawTemp) {
        console.warn("⚠️ Missing time or temp:", row);
        return;
      }
      console.log("⏱ Raw time string:", rawTime);

      const parsed = parse(rawTime, "MMM dd HH:mm:ss xxxx yyyy", new Date());
      const utcDate = fromZonedTime(parsed, "America/Los_Angeles");
      const now = new Date();
      const thirtyFiveDaysAgo = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);

      if (utcDate < thirtyFiveDaysAgo) {
        return; // Skip old rows
      }

      temperatureHistory.push({
        timestamp: utcDate.toISOString(),
        tempC: parseFloat(rawTemp),
      });
    } catch (err) {
      console.error("❌ Failed to parse row:", err.message);
    }
  })

  .on("end", () => {
    const output = {
      id: transformerId,
      type: "1ph-pad",
      kVA: 75,
      mfgDate: "2021-01-01",
      temperatureHistory,
    };

    fs.writeFileSync(`./output/${transformerId}.json`, JSON.stringify(output, null, 2));
    console.log(`✅ Transformer data written to output/${transformerId}.json`);
  });
