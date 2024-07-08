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

      // Sort the data based on the selected option
      let sortedData = [...data]; // Clone the array for sorting without modifying original

      if (selectedOption === "stars") {
        sortedData.sort((a, b) => b.stargazers_count - a.stargazers_count);
      } else if (selectedOption === "forks") {
        sortedData.sort((a, b) => b.forks_count - a.forks_count);
      } else if (selectedOption === "size") {
        sortedData.sort((a, b) => b.size - a.size);
      }

      // Populate mostStarredRepos and mostUsedLanguages
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

        // Render repo information
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

function prepareStats() {
  console.log(mostUsedLanguages);
  console.log(mostStarredRepos);
  console.log(starsPerLanguage);

  const languageColors = {
    JavaScript: "rgba(255, 99, 132, 0.6)",
    Python: "rgba(54, 162, 235, 0.6)",
    Java: "rgba(255, 206, 86, 0.6)",
    TypeScript: "rgba(75, 192, 192, 0.6)",
    Ruby: "rgba(153, 102, 255, 0.6)",
    CSS: "rgba(255, 159, 64, 0.6)",
    HTML: "rgba(255, 102, 102, 0.6)",
    PHP: "rgba(54, 162, 235, 0.6)",
    "C#": "rgba(75, 192, 192, 0.6)",
    "C++": "rgba(153, 102, 255, 0.6)",
    Shell: "rgba(255, 159, 64, 0.6)",
    "Objective-C": "rgba(255, 102, 102, 0.6)",
    Rust: "rgba(54, 162, 235, 0.6)",
    Swift: "rgba(75, 192, 192, 0.6)",
    Go: "rgba(153, 102, 255, 0.6)",
    Kotlin: "rgba(255, 159, 64, 0.6)",
    Vue: "rgba(255, 102, 102, 0.6)",
    Scala: "rgba(54, 162, 235, 0.6)",
    Perl: "rgba(75, 192, 192, 0.6)",
    Lua: "rgba(153, 102, 255, 0.6)",
    Haskell: "rgba(255, 159, 64, 0.6)",
    Matlab: "rgba(255, 102, 102, 0.6)",
    "Visual Basic": "rgba(54, 162, 235, 0.6)",
    Dart: "rgba(75, 192, 192, 0.6)",
    Assembly: "rgba(153, 102, 255, 0.6)",
    Delphi: "rgba(255, 159, 64, 0.6)",
    PowerShell: "rgba(255, 102, 102, 0.6)",
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

  // Create chart-2 (pie chart)
  new Chart(ctx1, {
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

  // Create chart-1 (bar chart)
  new Chart(ctx2, {
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
  new Chart(ctx3, {
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
