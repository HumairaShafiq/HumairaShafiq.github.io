let currentAudio = new Audio();
let audios;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getAudios(folder) {
  currFolder = folder;
  let a = await fetch(`/audios/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  audios = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      audios.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all the audios in the playlist
  let sUL = document.querySelector(".sList").getElementsByTagName("ul")[0];
  sUL.innerHTML = "";
  for (const audio of audios) {
    sUL.innerHTML =
      sUL.innerHTML +
      `<li> <img class="invert" src="img/audio.svg" alt="audio">
                  <div class="info">
                    <div>${audio.replaceAll("%20", "")}</div>
                    <div>Sohaib</div>
                  </div>
                  <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="play">
                  </div>
         </li>`;
  }
  //   Attach an event listener to each audio
  Array.from(
    document.querySelector(".sList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playAudio(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return audios;
}

const playAudio = (track, pause = false) => {
  // let audio = new Audio("/audios/" + track)
  currentAudio.src = `/${currFolder}/` + track;
  if (!pause) {
    currentAudio.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".sinfo").innerHTML = decodeURI(track);
  document.querySelector(".stime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/audios/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/audios") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];
      // Get the metadata of the folder
      let a = await fetch(`/audios/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 21 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 20V4L19 12L5 20Z"
                    stroke="#141B34"
                    fill="#000"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <img src="/audios/${folder}/cover.jpg" alt="cover" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }

  //Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      audios = await getAudios(`audios/${item.currentTarget.dataset.folder}`);
      playAudio(audios[0]);
    });
  });
}

async function main() {
  // Get the list of all the audios
  await getAudios("audios/ncs");
  playAudio(audios[0], true);

  // Display all the albums on the page
  displayAlbums();

  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentAudio.paused) {
      currentAudio.play();
      play.src = "img/pause.svg";
    } else {
      currentAudio.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event
  currentAudio.addEventListener("timeupdate", () => {
    document.querySelector(".stime").innerHTML = `${secondsToMinutesSeconds(
      currentAudio.currentTime
    )} / ${secondsToMinutesSeconds(currentAudio.duration)}`;
    document.querySelector(".circle").style.left =
      (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = e.target.getBoundingClientRect().width * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentAudio.currentTime = (currentAudio.duration * percent) / 100;
  });
  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    currentAudio.pause();
    console.log("Previous clicked");
    let index = audios.indexOf(currentAudio.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playAudio(audios[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentAudio.pause();
    console.log("Next clicked");
    let index = audios.indexOf(currentAudio.src.split("/").slice(-1)[0]);
    if (index + 1 < audios.length) {
      playAudio(audios[index + 1]);
    }
  });

  // Add an event listener to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/ 100");
      currentAudio.volume = parseInt(e.target.value) / 100;
      if (currentAudio.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      }
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentAudio.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentAudio.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
