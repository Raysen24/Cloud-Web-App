"use client";
import React, { useEffect, useState } from "react";

type TabItem = { id: string; title: string; content: string };

const STORAGE_KEY = "cwa_tabs_v1";
const MAX_TABS = 15;

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

export default function TabsBuilderPage() {
  const [tabs, setTabs] = useState<TabItem[]>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as TabItem[];
          if (Array.isArray(parsed) && parsed.length) {
            return parsed;
          }
        } catch {}
      }
    }
    return [{ id: uid("t_"), title: "Tab 1", content: "Content for tab 1" }];
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [outputHtml, setOutputHtml] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as TabItem[];
        if (Array.isArray(parsed) && parsed.length) {
          setTabs(parsed);
          setActiveIndex(0);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  }, [tabs]);

  function addTab() {
    if (tabs.length >= MAX_TABS) return alert(`Maximum ${MAX_TABS} tabs`);
    const next = [
      ...tabs,
      {
        id: uid("t_"),
        title: `Tab ${tabs.length + 1}`,
        content: "New content",
      },
    ];
    setTabs(next);
    setActiveIndex(next.length - 1);
  }

  function removeTab(index: number) {
    if (tabs.length === 1) return;
    const next = tabs.slice();
    next.splice(index, 1);
    setTabs(next);
    setActiveIndex(Math.max(0, index - 1));
  }

  function updateTab(index: number, patch: Partial<TabItem>) {
    const next = tabs.map((t, i) => (i === index ? { ...t, ...patch } : t));
    setTabs(next);
  }

  function generateOutputHTML(tabsArr: TabItem[]) {
    const json = JSON.stringify(tabsArr).replace(/</g, "\\u003c");

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Tabs Export</title>
</head>
<body style="font-family:Arial,Helvetica,sans-serif; padding:18px; background:#fff; color:#111;">
  <div id="cwa-root" style="max-width:900px; margin:0 auto;">
    <div id="cwa-tab-buttons" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;"></div>
    <div id="cwa-tab-content" style="border:1px solid #ddd; padding:12px; border-radius:6px;"></div>
  </div>

  <script>
  (function() {
    const tabs = ${json};
    const containerButtons = document.getElementById('cwa-tab-buttons');
    const containerContent = document.getElementById('cwa-tab-content');
    let active = 0;

    function sanitizeHTML(s){ return (''+s).replace(/</g,'&lt;'); }

    function render(){
      containerButtons.innerHTML = '';
      tabs.forEach((t, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = t.title;
        btn.style.padding = '8px 12px';
        btn.style.border = '1px solid #ccc';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        btn.style.background = i===active ? '#0f62fe' : '#fff';
        btn.style.color = i===active ? '#fff' : '#111';
        btn.onclick = function(){ active = i; render(); };
        containerButtons.appendChild(btn);
      });

      const current = tabs[active] || {title:'', content:''};
      const safeContent = (current.content || '').replace(/\\n/g, '<br>');
      containerContent.innerHTML = '<h3>' + sanitizeHTML(current.title) + '</h3>' 
         + '<div>' + safeContent + '</div>';
    }

    render();
  })();
  </script>
</body>
</html>`;
    return html;
  }

  function onGenerate() {
    const html = generateOutputHTML(tabs);
    setOutputHtml(html);
  }

  async function copyOutput() {
    if (!outputHtml) onGenerate();
    try {
      await navigator.clipboard.writeText(
        outputHtml || generateOutputHTML(tabs)
      );
      alert(
        "HTML copied to clipboard. Paste into Hello.html and open in a browser."
      );
    } catch {
      alert("Copy failed — you can use the text area to copy manually.");
    }
  }

  function openInNewTab() {
    const html = outputHtml || generateOutputHTML(tabs);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  return (
    <div>
      <h1>Tabs Builder (Assignment 1)</h1>

      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <button onClick={addTab}>+ Add tab</button>
        <button
          onClick={() => {
            if (confirm("Clear local storage?")) {
              localStorage.removeItem(STORAGE_KEY);
              setTabs([
                { id: uid("t_"), title: "Tab 1", content: "Content for tab 1" },
              ]);
              setActiveIndex(0);
            }
          }}
        >
          Reset
        </button>
        <div style={{ marginLeft: "auto" }}>Stored in localStorage</div>
      </div>

      {/* 3-column layout */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr 2fr", gap: 20 }}
      >
        {/* Left: Tabs list (rename + remove) */}
        <div>
          <h3>Tabs</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tabs.map((t, i) => (
              <li
                key={t.id}
                style={{
                  marginBottom: 8,
                  padding: 8,
                  border:
                    i === activeIndex
                      ? "1px solid var(--accent)"
                      : "1px solid #eee",
                  borderRadius: 6,
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    value={t.title}
                    onChange={(e) => updateTab(i, { title: e.target.value })}
                  />
                  <button onClick={() => setActiveIndex(i)}>Select</button>
                  <button onClick={() => removeTab(i)}>-</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Middle: Preview with live editable content */}
        <div>
          <h3>Preview & Edit</h3>
          <div
            style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              {tabs.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setActiveIndex(i)}
                  style={{
                    padding: "8px 12px",
                    background: i === activeIndex ? "var(--accent)" : "#fff",
                    color: i === activeIndex ? "#fff" : "#111",
                    borderRadius: 6,
                  }}
                >
                  {t.title}
                </button>
              ))}
            </div>
            <div
              style={{ padding: 12, border: "1px solid #eee", borderRadius: 6 }}
            >
              <h4>{tabs[activeIndex]?.title}</h4>
              <textarea
                style={{ width: "100%", minHeight: 120 }}
                value={tabs[activeIndex]?.content}
                onChange={(e) =>
                  updateTab(activeIndex, { content: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Right: Buttons + output code */}
        <div>
          <h3>Output</h3>
          <div style={{ marginBottom: 12 }}>
            <button onClick={onGenerate}>Generate Code</button>
            <button onClick={copyOutput} style={{ marginLeft: 2 }}>
              Copy Code
            </button>
            <button onClick={openInNewTab} style={{ marginLeft: 2 }}>
              Open Generated Code
            </button>
          </div>
          <label>Generated HTML (copy/paste into Hello.html)</label>
          <textarea
            readOnly
            value={outputHtml}
            style={{ width: "100%", minHeight: 200, whiteSpace: "pre-wrap" }}
          />
        </div>
      </div>
    </div>
  );
}
