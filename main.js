const userInput = document.getElementById("input");
let userName = userInput.value;
const submitButton = document.getElementById("btn");
const personalInfoDiv = document.getElementById("personal-info-wrapper");
const inputSection = document.getElementById("main");
const repoInfoDiv = document.getElementById("repo-info-container");
const repoDiv = document.getElementById("repo-info-wrapper");
const credit = document.getElementsByClassName("credit")[0];

userInput.addEventListener("input", function () {
    userName = userInput.value;
})

submitButton.addEventListener("click", () => {
    inputSection.style.display = "none";
    personalInfoDiv.style.display = "flex";
    repoDiv.style.display = "block";
    credit.style.background = "#1a1e22"
    profileInfo();
    repoInfo();
})



function profileInfo() {
    fetch(`https://api.github.com/users/${userName}`)
        .then((res) => res.json())
        .then((data) => {


            const date = new Date(data.created_at);
            const options = { year: "numeric", month: "long", day: "numeric" };
            const firstLogin = date.toLocaleDateString("en-US", options);





            console.log(data);
            personalInfoDiv.innerHTML = `
    <div id="personal-info">
    <div class="user-avatar">
    <img draggable="false" src=${data.avatar_url}" alt="">
    </div>
    <h1 class="user-name">${data.name}</h1>
     <h2 class="user-login"><a href="https://github.com/${data.login}">@${data.login}</a></h2>
    <div class="info">
    <p><i class="fa fa-map-marker" aria-hidden="true"></i> ${data.location} </p>  <p><i class="fa fa-calendar" aria-hidden="true"></i> Joined ${firstLogin}</p>
     </div>
    <div class="profile-stats">
    <div class="ps-card"><h2>${data.public_repos}</h2> <p>Repositories</p> </div>
    <div class="ps-card"><h2>${data.followers}</h2> <p>Followers</p> </div>
    <div class="ps-card"><h2>${data.following}</h2> <p>Following</p> </div>
    </div>
    </div>`
        })
}



function repoInfo() {
    fetch(`https://api.github.com/users/${userName}/repos`)
        .then((res) => res.json())
        .then((data) => {
            console.log(data);

            for (let i = 0; i < data.length; i++) {
                let forkInfo = data[i].fork ? " / Forked" : "";
                let description = data[i].description === null ? " No Description" : data[i].description;
                let language = data[i].language === null ? " " : data[i].language;

                repoInfoDiv.innerHTML += `
                <li>
                <a class="card" href="https://github.com/${data[i].full_name}" target="_blank">
                    
                        <div class="repo-details">
                            <h2 class="repo-title">${data[i].name + forkInfo}</h2>
                            <p class="repo-desc">${description}</p>
                        </div>
                        <div class="repo-properties">
                            <div class="repo-prop-left">
                                <span class="lang">${language}</span>
                                <p class="stars"><i class="fa fa-star-o" aria-hidden="true"></i><span>${data[i].stargazers_count}</span></p>
                                <p class="forks"><i class="fa fa-code-fork" aria-hidden="true"></i><span>${data[i].forks_count}</span></p>
                            </div>
                            <div class="repo-prop-right">
                                <p class="size"><span>${data[i].size} KB</span></p>
                            </div>
                        </div>
                    
                    </a>
                    </li>
                `;
            }
        })
}
