const fs = require("fs");
const path = require("path");

const SECTIONS_DIR = path.join(__dirname, "../sections");

const scheduleSettingIds = ["schedule", "from_date", "to_date", "time"];

function removeScheduleSettings(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  const schemaMatch = content.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
  if (!schemaMatch) return;

  let schemaJson;
  try {
    schemaJson = JSON.parse(schemaMatch[1].trim());
  } catch (err) {
    console.error(`❌ Failed to parse schema in ${filePath}`);
    return;
  }

  if (!schemaJson.settings) return;

  const originalLength = schemaJson.settings.length;
  schemaJson.settings = schemaJson.settings.filter(
    (s) => !scheduleSettingIds.includes(s.id)
  );

  if (schemaJson.settings.length < originalLength) {
    const newSchema = `{% schema %}\n${JSON.stringify(schemaJson, null, 2)}\n{% endschema %}`;
    const newContent = content.replace(schemaMatch[0], newSchema);
    fs.writeFileSync(filePath, newContent, "utf8");

    console.log(`🧼 Removed schedule settings from: ${path.basename(filePath)}`);
  } else {
    console.log(`✅ No schedule settings found in: ${path.basename(filePath)}`);
  }
}

fs.readdirSync(SECTIONS_DIR)
  .filter((file) => file.endsWith(".liquid"))
  .forEach((file) => {
    removeScheduleSettings(path.join(SECTIONS_DIR, file));
  });