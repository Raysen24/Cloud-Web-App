import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Welcome - CWA Assignment 1</h1>
      <p>
        This project builds a tab-editor that outputs HTML + JS with inline CSS so the output can be copied and pasted into a plain HTML file (Hello.html).
      </p>

      <p>
        {/* ✅ Use Link instead of <a> */}
        <Link href="/tabs">Open the Tabs builder →</Link>
      </p>
    </div>
  );
}
