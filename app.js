// Google Sheet JSON feed (stable, no CSV issues)
const SHEET_URL =
"https://docs.google.com/spreadsheets/d/1-zXVSkUVs1TEYutbPaKPjaJ0cGTxvxzWqkZ1ynNZG1Y/gviz/tq?tqx=out:json";

// Default images by Group Type (life stage)
const DEFAULT_IMAGES = {
  "Life & Community": "images/life-community.jpg",
  "For the Ladies": "images/for-the-ladies.jpg",
  "For the Guys": "images/for-the-guys.jpg",
  "Support Groups": "images/support-groups.jpg",
  "Growth & Discipleship": "images/growth-discipleship.jpg",
  "Next Gen": "images/next-gen.jpg",
  "Other": "images/life-community.jpg"
};

fetch(SHEET_URL)
  .then(r => r.text())
  .then(t => {
    const json = JSON.parse(t.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const groups = rows
      // skip header row if it sneaks in
      .filter(r => r.c[1]?.v && r.c[1].v !== "Group Name")
      .map(r => {
        const c = r.c;
        const lifeStage = c[4]?.v || "Other";
        return {
          leaders: c[0]?.v || "",
          name: c[1]?.v || "",
          time: (c[2]?.v || "").split(",")[0],
          location: c[5]?.v || "",
          signup: c[3]?.v || "#",
          lifeStage,
          image: DEFAULT_IMAGES[lifeStage] || DEFAULT_IMAGES["Other"]
        };
      });

    buildApp(groups);
  });

function buildApp(groups) {
  const app = document.getElementById("vh-groups-app");
  const stages = ["All", ...new Set(groups.map(g => g.lifeStage))];

  app.innerHTML = `
    <div class="vh-header">
      <h1>Find Your People</h1>
      <p>Small Groups at Victory Hill Church</p>
    </div>
    <div class="vh-filters">
      ${stages.map((s,i)=>`<button class="vh-filter-btn ${i? "":"active"}" data-stage="${s}">${s}</button>`).join("")}
    </div>
    <div class="vh-groups"></div>
  `;

  const grid = app.querySelector(".vh-groups");
  const buttons = app.querySelectorAll(".vh-filter-btn");

  const render = stage => {
    grid.innerHTML = "";
    groups.filter(g => stage==="All" || g.lifeStage===stage).forEach(g=>{
      grid.innerHTML += `
        <div class="vh-card">
          <img src="${g.image}" alt="${g.name}">
          <div class="vh-card-content">
            <h3>${g.name}</h3>
            <div class="vh-leaders">${g.leaders}</div>
            <div class="vh-meta">${g.time}</div>
            <div class="vh-location">${g.location}</div>
            <a class="vh-signup" href="${g.signup}" target="_blank">Sign Up</a>
          </div>
        </div>`;
    });
  };

  buttons.forEach(b=>b.onclick=()=>{
    buttons.forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    render(b.dataset.stage);
  });

  render("All");
}
