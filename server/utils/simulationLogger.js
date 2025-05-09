const fs = require("fs");
const path = require("path");

function ensureLogDir() {
	const dir = path.join(__dirname, "..", "logs");
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	return dir;
}

/**
 * Write out the CSV and LOG for 1st simulation in a batch.
 */
function writeSimulationLogs(user, yearByYear, eventLog) {
	const now = new Date();
	const ts = now.toISOString().replace(/[:.]/g, "-");
	const filename = `${user.name}_${ts}`;
	const dir = ensureLogDir();

	// headers = Year + each distinct special_id in the investments of the first year
	const investments = yearByYear[0].investments.map((i) => i.special_id);
	const csvLines = [];
	csvLines.push(`Year,${investments.join(",")}`);

	for (const yd of yearByYear) {
		const values = investments.map((id) => {
			const inv = yd.investments.find((i) => i.special_id === id);
			return inv ? inv.value.toFixed(2) : "";
		});
		csvLines.push(`${yd.year},${values.join(",")}`);
	}

	fs.writeFileSync(path.join(dir, `${filename}.csv`), csvLines.join("\n"), "utf8");

	// one block per event
	const logLines = eventLog.map((e) => {
		const header = `${e.year} - "${e.type}" - "${e.name}"`;
		const desc = e.description ? e.description : "";
		const change = `Change: ${e.change.toFixed(2)}`;
		const details = "Details:\n" + e.details.map((d) => `    - ${d}`).join("\n");
		return [header, desc, change, details].filter((l) => l).join("\n");
	});

	fs.writeFileSync(path.join(dir, `${filename}.log`), logLines.join("\n\n"), "utf8");
}

module.exports = { writeSimulationLogs };
