import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const difficulty = event.queryStringParameters?.difficulty ?? 'easy';

  const rows = await prisma.gameSession.findMany({
    where: { difficulty },
    orderBy: { timeTaken: 'asc' },
    take: 10,
    include: { user: true },
  });

  const rowsHtml = rows
    .map(
      (row: any, idx: number) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${row.user.displayName}</td>
        <td>${row.timeTaken}</td>
        <td>${row.finishedAt.toISOString()}</td>
      </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Coding Escape Leaderboard – ${difficulty}</title>
  <style>
    body { background:#020617; color:#e5e7eb; font-family:system-ui,sans-serif; padding:24px; }
    h1 { margin-top:0; }
    table { border-collapse: collapse; margin-top: 16px; width:100%; max-width:640px; }
    th, td { padding: 6px 10px; border: 1px solid #4b5563; font-size:13px; }
    th { background:#111827; }
  </style>
</head>
<body>
  <h1>Coding Escape – ${difficulty} leaderboard</h1>
  <table>
    <tr><th>#</th><th>Player</th><th>Time (s)</th><th>Finished</th></tr>
    ${rowsHtml || '<tr><td colspan="4">No runs yet.</td></tr>'}
  </table>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html,
  };
};
