const userInput = document.getElementById("input");
let userName = userInput.value;
const submitButton = document.getElementById("btn");
const personalInfoDiv = document.getElementById("personal-info-wrapper");
const chartContainerDiv = document.getElementById("chart-container");
const inputSection = document.getElementById("main");
const repoInfoDiv = document.getElementById("repo-info-container");
const repoDiv = document.getElementById("repo-info-wrapper");
const credit = document.getElementsByClassName("credit")[0];
const selectField = document.getElementById("repo-sort-items");

// Initialize global variables
let mostUsedLanguages = {};
let mostStarredRepos = [];
let starsPerLanguage = {};

function profileInfo() {
  fetch(`https://api.github.com/users/${userName}`)
    .then((res) => res.json())
    .then((data) => {
      const date = new Date(data.created_at);
      const options = { year: "numeric", month: "long", day: "numeric" };
      const firstLogin = date.toLocaleDateString("en-US", options);

      personalInfoDiv.innerHTML = `
        <div id="personal-info">
          <div class="user-avatar">
            <img draggable="false" src="${data.avatar_url}" alt="">
          </div>
          <h1 class="user-name">${data.name}</h1>
          <h2 class="user-login"><a href="https://github.com/${data.login}">@${data.login}</a></h2>
          <div class="info">
            <p><i class="fa fa-map-marker" aria-hidden="true"></i> ${data.location}</p>
            <p><i class="fa fa-calendar" aria-hidden="true"></i> Joined ${firstLogin}</p>
          </div>
          <div class="profile-stats">
            <div class="ps-card"><h2>${data.public_repos}</h2><p>Repositories</p></div>
            <div class="ps-card"><h2>${data.followers}</h2><p>Followers</p></div>
            <div class="ps-card"><h2>${data.following}</h2><p>Following</p></div>
          </div>
        </div>
        `;

      chartContainerDiv.innerHTML = `        
        <div class="chart-box">
          <div class="chart-heading"><h1>Top Languages</h1></div>
          <div class="chart-display">
            <canvas id="chart-1"></canvas>
          </div>
        </div>

        <div class="chart-box">
          <div class="chart-heading"><h1>Most Starred</h1></div>
          <div class="chart-display">
            <canvas id="chart-2"></canvas>
          </div>
        </div>

        <div class="chart-box">
          <div class="chart-heading"><h1>Stars per Language</h1></div>
          <div class="chart-display">
            <canvas id="chart-3"></canvas>
          </div>
        </div>
        `;
    })
    .catch((error) => {
      console.log("Error fetching profile information:", error);
      personalInfoDiv.innerHTML = `<h3 class="alert">Error fetching profile information. Please try again.</h3>`;
    });
}

function repoInfo() {
  fetch(`https://api.github.com/users/${userName}/repos`)
    .then((res) => res.json())
    .then((data) => {
      const selectedOption = selectField.value;

      // Clear previous data
      mostUsedLanguages = {};
      mostStarredRepos = [];
      starsPerLanguage = {};
      repoInfoDiv.innerHTML = "";
      // Sort the data based on the selected option
      let sortedData = [...data];
      console.log(sortedData);

      if (selectedOption === "stars") {
        sortedData.sort((a, b) => b.stargazers_count - a.stargazers_count);
      } else if (selectedOption === "forks") {
        sortedData.sort((a, b) => b.forks_count - a.forks_count);
      } else if (selectedOption === "size") {
        sortedData.sort((a, b) => b.size - a.size);
      }
      console.log(sortedData);
      sortedData.forEach((repo) => {
        if (repo.fork) {
          return;
        }
        const language = repo.language || "Unknown";

        if (mostUsedLanguages[language]) {
          mostUsedLanguages[language]++;
        } else {
          mostUsedLanguages[language] = 1;
        }

        if (starsPerLanguage[language]) {
          starsPerLanguage[language] += repo.stargazers_count;
        } else {
          starsPerLanguage[language] = repo.stargazers_count;
        }

        mostStarredRepos.push({
          name: repo.name,
          stars: repo.stargazers_count,
        });

        // const forkInfo = repo.fork ? " / Forked" : "";
        const description = repo.description || " No Description";

        repoInfoDiv.innerHTML += `
          <li>
            <a class="card" href="https://github.com/${repo.full_name}" target="_blank">
              <div class="repo-details">
                <h2 class="repo-title">${repo.name}</h2>
                <p class="repo-desc">${description}</p>
              </div>
              <div class="repo-properties">
                <div class="repo-prop-left">
                  <span class="lang">${language}</span>
                  <p class="stars"><i class="fa fa-star-o" aria-hidden="true"></i><span>${repo.stargazers_count}</span></p>
                  <p class="forks"><i class="fa fa-code-fork" aria-hidden="true"></i><span>${repo.forks_count}</span></p>
                </div>
                <div class="repo-prop-right">
                  <p class="size"><span>${repo.size} KB</span></p>
                </div>
              </div>
            </a>
          </li>
        `;
      });

      // Sort mostStarredRepos by stars in descending order
      mostStarredRepos.sort((a, b) => b.stars - a.stars);

      // Call prepareStats after data is fully processed
      prepareStats();
    })
    .catch((error) => {
      console.log("Error fetching repository information:", error);
      repoInfoDiv.innerHTML = `<h3 class="alert">Error fetching repository information. Please try again.</h3>`;
    });
}

userInput.addEventListener("input", function () {
  userName = userInput.value;
});

document.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    submitButton.click();
    console.log("hello");
  }
});

submitButton.addEventListener("click", () => {
  chartContainerDiv.style.display = "grid";
  inputSection.style.display = "none";
  personalInfoDiv.style.display = "flex";
  repoDiv.style.display = "block";
  credit.style.background = "#1a1e22";
  profileInfo();
  repoInfo();
});

selectField.addEventListener("change", () => {
  repoInfo();
});

let chart1, chart2, chart3;
function prepareStats() {
  console.log(mostUsedLanguages);
  console.log(mostStarredRepos);
  console.log(starsPerLanguage);

  const languageColors = {
    Mercury: "#ff2b2b",
    TypeScript: "#2b7489",
    PureBasic: "#5a6986",
    "Objective-C++": "#6866fb",
    Self: "#0579aa",
    edn: "#db5855",
    NewLisp: "#87AED7",
    "Jupyter Notebook": "#DA5B0B",
    Rebol: "#358a5b",
    Frege: "#00cafe",
    Dart: "#00B4AB",
    AspectJ: "#a957b0",
    Shell: "#89e051",
    "Web Ontology Language": "#9cc9dd",
    xBase: "#403a40",
    Eiffel: "#946d57",
    Nix: "#7e7eff",
    RAML: "#77d9fb",
    MTML: "#b7e1f4",
    Racket: "#22228f",
    Elixir: "#6e4a7e",
    SAS: "#B34936",
    Agda: "#315665",
    wisp: "#7582D1",
    D: "#ba595e",
    Kotlin: "#F18E33",
    Opal: "#f7ede0",
    Crystal: "#776791",
    "Objective-C": "#438eff",
    "ColdFusion CFC": "#ed2cd6",
    Oz: "#fab738",
    Mirah: "#c7a938",
    "Objective-J": "#ff0c5a",
    Gosu: "#82937f",
    FreeMarker: "#0050b2",
    Ruby: "#701516",
    "Component Pascal": "#b0ce4e",
    Arc: "#aa2afe",
    Brainfuck: "#2F2530",
    Nit: "#009917",
    APL: "#5A8164",
    Go: "#375eab",
    "Visual Basic": "#945db7",
    PHP: "#4F5D95",
    Cirru: "#ccccff",
    SQF: "#3F3F3F",
    Glyph: "#e4cc98",
    Java: "#b07219",
    MAXScript: "#00a6a6",
    Scala: "#DC322F",
    Makefile: "#427819",
    ColdFusion: "#ed2cd6",
    Perl: "#0298c3",
    Lua: "#000080",
    Vue: "#2c3e50",
    Verilog: "#b2b7f8",
    Factor: "#636746",
    Haxe: "#df7900",
    "Pure Data": "#91de79",
    Forth: "#341708",
    Red: "#ee0000",
    Hy: "#7790B2",
    Volt: "#1F1F1F",
    LSL: "#3d9970",
    eC: "#913960",
    CoffeeScript: "#244776",
    HTML: "#e44b23",
    Lex: "#DBCA00",
    "API Blueprint": "#2ACCA8",
    Swift: "#ffac45",
    C: "#555555",
    AutoHotkey: "#6594b9",
    Isabelle: "#FEFE00",
    Metal: "#8f14e9",
    Clarion: "#db901e",
    JSONiq: "#40d47e",
    Boo: "#d4bec1",
    AutoIt: "#1C3552",
    Clojure: "#db5855",
    Rust: "#dea584",
    Prolog: "#74283c",
    SourcePawn: "#5c7611",
    AMPL: "#E6EFBB",
    FORTRAN: "#4d41b1",
    ANTLR: "#9DC3FF",
    Harbour: "#0e60e3",
    Tcl: "#e4cc98",
    BlitzMax: "#cd6400",
    PigLatin: "#fcd7de",
    Lasso: "#999999",
    ECL: "#8a1267",
    VHDL: "#adb2cb",
    Elm: "#60B5CC",
    "Propeller Spin": "#7fa2a7",
    X10: "#4B6BEF",
    IDL: "#a3522f",
    ATS: "#1ac620",
    Ada: "#02f88c",
    "Unity3D Asset": "#ab69a1",
    Nu: "#c9df40",
    LFE: "#004200",
    SuperCollider: "#46390b",
    Oxygene: "#cdd0e3",
    ASP: "#6a40fd",
    Assembly: "#6E4C13",
    Gnuplot: "#f0a9f0",
    JFlex: "#DBCA00",
    NetLinx: "#0aa0ff",
    Turing: "#45f715",
    Vala: "#fbe5cd",
    Processing: "#0096D8",
    Arduino: "#bd79d1",
    FLUX: "#88ccff",
    NetLogo: "#ff6375",
    "C Sharp": "#178600",
    CSS: "#563d7c",
    "Emacs Lisp": "#c065db",
    Stan: "#b2011d",
    SaltStack: "#646464",
    QML: "#44a51c",
    Pike: "#005390",
    LOLCODE: "#cc9900",
    ooc: "#b0b77e",
    Handlebars: "#01a9d6",
    J: "#9EEDFF",
    Mask: "#f97732",
    EmberScript: "#FFF4F3",
    TeX: "#3D6117",
    Nemerle: "#3d3c6e",
    KRL: "#28431f",
    "Ren'Py": "#ff7f7f",
    "Unified Parallel C": "#4e3617",
    Golo: "#88562A",
    Fancy: "#7b9db4",
    OCaml: "#3be133",
    Shen: "#120F14",
    Pascal: "#b0ce4e",
    "F#": "#b845fc",
    Puppet: "#302B6D",
    ActionScript: "#882B0F",
    Diff: "#88dddd",
    "Ragel in Ruby Host": "#9d5200",
    Fantom: "#dbded5",
    Zephir: "#118f9e",
    Click: "#E4E6F3",
    Smalltalk: "#596706",
    DM: "#447265",
    Ioke: "#078193",
    PogoScript: "#d80074",
    LiveScript: "#499886",
    JavaScript: "#f1e05a",
    VimL: "#199f4b",
    PureScript: "#1D222D",
    ABAP: "#E8274B",
    Matlab: "#bb92ac",
    Slash: "#007eff",
    R: "#198ce7",
    Erlang: "#B83998",
    Pan: "#cc0000",
    LookML: "#652B81",
    Eagle: "#814C05",
    Scheme: "#1e4aec",
    PLSQL: "#dad8d8",
    Python: "#3572A5",
    Max: "#c4a79c",
    "Common Lisp": "#3fb68b",
    Latte: "#A8FF97",
    XQuery: "#5232e7",
    Omgrofl: "#cabbff",
    XC: "#99DA07",
    Nimrod: "#37775b",
    SystemVerilog: "#DAE1C2",
    Chapel: "#8dc63f",
    Groovy: "#e69f56",
    Dylan: "#6c616e",
    E: "#ccce35",
    Parrot: "#f3ca0a",
    "Grammatical Framework": "#79aa7a",
    "Game Maker Language": "#8fb200",
    Papyrus: "#6600cc",
    "NetLinx+ERB": "#747faa",
    Clean: "#3F85AF",
    Alloy: "#64C800",
    Squirrel: "#800000",
    PAWN: "#dbb284",
    UnrealScript: "#a54c4d",
    "Standard ML": "#dc566d",
    Slim: "#ff8f77",
    Perl6: "#0000fb",
    Julia: "#a270ba",
    Haskell: "#29b544",
    NCL: "#28431f",
    Io: "#a9188d",
    Rouge: "#cc0088",
    "C++": "#f34b7d",
    "AGS Script": "#B9D9FF",
    Dogescript: "#cca760",
    nesC: "#94B0C7",
  };

  const staticColors = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
  ];

  const ctx1 = document.getElementById("chart-1").getContext("2d");
  const ctx2 = document.getElementById("chart-2").getContext("2d");
  const ctx3 = document.getElementById("chart-3").getContext("2d");

  // Destroy existing charts if they exist
  //   if (chart1) chart1.destroy();
  //   if (chart2) chart2.destroy();
  //   if (chart3) chart3.destroy();

  //Re-rendering of charts repositories are getting sorted
  if (chart1) return;

  // Dataset for chart-1 (bar chart)
  const dataset1 = {
    label: "",
    data: mostStarredRepos.slice(0, 5).map((repo) => repo.stars),
    backgroundColor: staticColors,
    borderWidth: 1,
  };

  // Dataset for chart-2 (pie chart)
  const dataset2 = {
    label: "",
    data: Object.values(mostUsedLanguages),
    backgroundColor: Object.keys(mostUsedLanguages).map(
      (language) => languageColors[language] || "rgba(0, 0, 0, 0.6)"
    ),
    borderWidth: 1,
  };

  // Dataset for chart-3 (pie chart)
  const dataset3 = {
    label: "",
    data: Object.values(starsPerLanguage),
    backgroundColor: Object.keys(starsPerLanguage).map(
      (language) => languageColors[language] || "rgba(0, 0, 0, 0.6)"
    ),
    borderWidth: 1,
  };

  // Create chart-1 (pie chart)
  chart1 = new Chart(ctx1, {
    type: "pie",
    data: {
      labels: Object.keys(mostUsedLanguages),
      datasets: [dataset2],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          display: false,
          beginAtZero: true,
        },
      },
    },
  });

  // Create chart-2 (bar chart)
  chart2 = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: mostStarredRepos.slice(0, 5).map((repo) => repo.name),
      datasets: [dataset1],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Create chart-3 (pie chart)
  chart3 = new Chart(ctx3, {
    type: "doughnut",
    data: {
      labels: Object.keys(starsPerLanguage),
      datasets: [dataset3],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          display: false,
          beginAtZero: true,
        },
      },
    },
  });
}
