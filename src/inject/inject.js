const WATCH_LATER_VIDEOS_SELECTOR =
  ".playlist-items.style-scope.ytd-playlist-panel-renderer .yt-simple-endpoint.style-scope.ytd-playlist-panel-video-renderer .style-scope.ytd-thumbnail-overlay-time-status-renderer";

const WATCH_LATER_PREFIX_SELECTOR =
  "#header-description > h3:nth-child(1) > yt-formatted-string > a";

const CURRENT_VIDEO_INDEX_SELECTOR =
  "#publisher-container > div > yt-formatted-string > span:nth-child(1)";

const TOTAL_VIDEO_INDEX_SELECTOR =
  "#publisher-container > div > yt-formatted-string > span:nth-child(3)";

let numberOfVideosRef = "";
let canObserve = false;
let originalPrefix = "";
let currentVideoRef = "";

function getTotalDuration() {
  const videoDurationSpans = Array.from(
    document.querySelectorAll(WATCH_LATER_VIDEOS_SELECTOR)
  ).filter(
    (timeStatus) => timeStatus.tagName === "SPAN" && timeStatus.id === "text"
  );

  if (!videoDurationSpans.length) return;

  const videoDurationList = videoDurationSpans.map((span) =>
    span.textContent.trim()
  );

  const durationInSecondsList = videoDurationList.map((duration) =>
    duration.split(":").reduce((acc, cur) => 60 * acc + +cur)
  );

  const totalDuration = durationInSecondsList.reduce((total, seconds) => {
    return total + seconds;
  });

  const description = new Date(totalDuration * 1000)
    .toISOString()
    .slice(11, 19);

  const playlistTitle = document.querySelector(WATCH_LATER_PREFIX_SELECTOR);

  playlistTitle.textContent = `${originalPrefix} - ${description}`;
}

window.onload = () => {
  setTimeout(() => {
    const playlistTitle = document.querySelector(WATCH_LATER_PREFIX_SELECTOR);

    originalPrefix = playlistTitle.textContent;

    getTotalDuration();

    canObserve = true;
  }, 1000);
};

const targetNode = document.body;

const observer = new MutationObserver((mutationsList) => {
  if (!canObserve) return;

  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.nodeName === "DIV") {
          const items = Array.from(
            document.querySelectorAll(WATCH_LATER_VIDEOS_SELECTOR)
          ).filter(
            (timeStatus) =>
              timeStatus.tagName === "SPAN" && timeStatus.id === "text"
          );

          const divided = document.querySelector(
            TOTAL_VIDEO_INDEX_SELECTOR
          )?.textContent;

          if (divided && divided != numberOfVideosRef) {
            numberOfVideosRef = divided;
            getTotalDuration();
            return;
          }

          if (items.length.toString() != numberOfVideosRef) {
            numberOfVideosRef = items.length;
            getTotalDuration();
            return;
          }

          const currentVideoIndex = document.querySelector(
            CURRENT_VIDEO_INDEX_SELECTOR
          ).textContent;

          if (currentVideoIndex != currentVideoRef) {
            currentVideoRef = currentVideoIndex;
            getTotalDuration();
            return;
          }
        }
      }
    }
  }
});

const config = { childList: true, subtree: true };
observer.observe(targetNode, config);
