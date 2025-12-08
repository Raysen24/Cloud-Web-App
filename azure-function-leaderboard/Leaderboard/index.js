const DEFAULT_BASE_URL =
  process.env.LEADERBOARD_BASE_URL ||
  "https://cwa-next-app.salmonsky-18cb5f22.southeastasia.azurecontainerapps.io";

module.exports = async function (context, req) {
  const difficulty = (req.query.difficulty || "easy").toLowerCase();
  const name = (req.query.name || "Guest").toString();

  const apiUrl =
    DEFAULT_BASE_URL + "/api/leaderboard?difficulty=" +
    encodeURIComponent(difficulty);

  let leaderboardRows = [];
  let errorMessage = null;

  try {
    const apiRes = await fetch(apiUrl, {
      headers: { "Accept": "application/json" }
    });

    if (!apiRes.ok) {
      throw new Error("Upstream returned " + apiRes.status);
    }

    const data = await apiRes.json();

    if (Array.isArray(data.leaderboard)) {
      leaderboardRows = data.leaderboard;
    } else {
      errorMessage = "API did not return expected leaderboard array.";
    }
  } catch (err) {
    context.log.error("Failed to fetch leaderboard:", err);
    errorMessage = "Could not load leaderboard from main app.";
  }

  const tableRows = leaderboardRows.map((row, index) => {
    const rank = row.rank ?? index + 1;
    const player = row.player ?? "Unknown";
    const timeTaken = row.timeTaken ?? "?";
    const finishedAt = row.finishedAt
      ? new Date(row.finishedAt).toISOString()
      : "";

    return `
      <tr>
        <td>${rank}</td>
        <td>${player}</td>
        <td>${timeTaken}</td>
        <td>${finishedAt}</td>
      </tr>`;
  }).join("");

  let tableHtml;
  if (leaderboardRows.length === 0) {
    tableHtml = `
      <p>No runs recorded yet for <strong>${difficulty}</strong>. Be the first to escape!</p>`;
  } else {
    tableHtml = `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Time (s)</th>
            <th>Finished at</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>`;
  }

  const now = new Date().toISOString();

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Coding Escape – ${difficulty} leaderboard (cloud lambda)</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #020617; color: #e5e7eb; }
    h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
    p { margin: 0.25rem 0; }
    table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
    th, td { border: 1px solid #374151; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #111827; }
    tr:nth-child(even) td { background: #020617; }
    .tag { display: inline-block; padding: 0.1rem 0.5rem; border-radius: 9999px;
           border: 1px solid #4b5563; font-size: 0.75rem; }
    .error { margin-top: 0.75rem; color: #fecaca; }
  </style>
</head>
<body>
  <h1>Cloud lambda leaderboard (${difficulty})</h1>
  <p>Hello, <strong>${name}</strong> 👋</p>
  <p>This HTML page was generated <span class="tag">dynamically</span> at
     <strong>${now}</strong> by an Azure Function.</p>
  <p>Data source: <code>${apiUrl}</code></p>
  ${errorMessage ? `<p class="error">${errorMessage}</p>` : ""}
  ${tableHtml}
</body>
</html>`;

  context.res = {
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: html
  };
};
