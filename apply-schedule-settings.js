const fs = require("fs");
const path = require("path");

const SECTIONS_DIR = path.join(__dirname, "../sections");

const scheduleSettings = [
    {
      type: "checkbox",
      id: "schedule",
      label: "Enable scheduling",
      default: false,
      info: "Use this to toggle schedule visibility.",

    },
    {
      type: "text",
      id: "from_date",
      label: "From date",
      default: "2025-01-01", // Required non-empty default
      info: "Start date for visibility (YYYY-MM-DD).",
      visible_if: "{{ section.settings.schedule == true }}"
    },
    {
      type: "text",
      id: "to_date",
      label: "To date",
      default: "2025-12-31", // Required non-empty default
      info: "End date for visibility (YYYY-MM-DD).",
       visible_if: "{{ section.settings.schedule == true }}"
    },
    {
      type: "text",
      id: "time",
      label: "Time (optional)",
      default: "00:00", // Required non-empty default
      info: "Optional time for scheduling (HH:MM).",
      visible_if: "{{ section.settings.schedule == true }}",
    },
  ];

function injectScheduleSettings(filePath) {
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

  if (!schemaJson.settings) schemaJson.settings = [];

  const hasSchedule = schemaJson.settings.some((s) => s.id === "schedule");

  if (!hasSchedule) {
    schemaJson.settings.push(...scheduleSettings);

    const newSchema = `{% schema %}\n${JSON.stringify(schemaJson, null, 2)}\n{% endschema %}`;
    const newContent = content.replace(schemaMatch[0], newSchema);
    fs.writeFileSync(filePath, newContent, "utf8");

    console.log(`✅ Updated: ${path.basename(filePath)}`);
  } else {
    console.log(`⚠️ Already includes schedule settings: ${path.basename(filePath)}`);
  }
}

fs.readdirSync(SECTIONS_DIR)
  .filter((file) => file.endsWith(".liquid"))
  .forEach((file) => {
    injectScheduleSettings(path.join(SECTIONS_DIR, file));
  });