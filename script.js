function parseSitemap(text) {
  const volumes = [];

  const lines = text.split(/\r?\n/);
  let current = null;

  function push() {
    if (current && current.number) {
      volumes.push(current);
    }
  }

  for (let raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // New volume
    if (line.startsWith("*")) {
      push();
      const match = line.match(/Volume\s+(\d+)/i);
      current = {
        number: match ? parseInt(match[1]) : null,
        date: "",
        cover: "",
        contents: "",
        pdf: ""
      };
      continue;
    }

    if (!current) continue;

    const parts = line.split(":");
    if (parts.length < 2) continue;

    const key = parts[0].toLowerCase();
    const value = parts.slice(1).join(":").trim();

    if (key.includes("date")) current.date = value;
    if (key.includes("small cover")) current.cover = value;
    if (key.includes("contents")) current.contents = value;
    if (key.includes("pdf")) current.pdf = value;
  }

  push();
  return volumes;
}

function createCard(v) {
  const clickable = v.contents !== "";

  const card = document.createElement(clickable ? "a" : "div");
  card.className = "card";
  if (clickable) {
    card.href = v.contents;
    card.target = "_blank";
  }

  // COVER
  const cover = document.createElement("div");
  cover.className = "cover";

  if (v.cover) {
    const img = document.createElement("img");
    img.src = v.cover;
    cover.appendChild(img);
  } else {
    cover.innerHTML = `
      <div class="placeholder">
        <strong>Volume ${v.number}</strong><br/>
        <small>${clickable ? "View contents" : "Coming soon"}</small>
      </div>
    `;
  }

  // BODY
  const body = document.createElement("div");
  body.className = "body";

  body.innerHTML = `
    <h3>Volume ${v.number}</h3>
    <p>${v.date || "Date TBA"}</p>
    <div class="badges">
      ${v.contents ? '<span class="badge">Contents</span>' : ""}
      ${v.pdf ? '<span class="badge">PDF</span>' : ""}
    </div>
  `;

  card.appendChild(cover);
  card.appendChild(body);

  return card;
}

async function init() {
  document.getElementById("year").textContent = new Date().getFullYear();

  const status = document.getElementById("status");
  const grid = document.getElementById("grid");

  try {
    const res = await fetch("sitemap.txt");
    const text = await res.text();

    const volumes = parseSitemap(text);

    status.textContent = `${volumes.length} volumes`;

    volumes.forEach(v => {
      grid.appendChild(createCard(v));
    });

  } catch (e) {
    status.textContent = "Failed to load sitemap";
  }
}

init();
