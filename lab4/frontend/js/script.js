const createWordBtn = document.getElementById("createWordBtn");
const searchWordBtn = document.getElementById("searchWordBtn");
const errorMessageElement = document.getElementById("errorMessage");
const successResultsElement = document.getElementById("successResults");
const searchResultsElement = document.getElementById("searchResults");
const wordElement = document.getElementById("word");
const definitionElement = document.getElementById("definition");

// Used to ensure correct URL is used for local and production environments
function getEndpointUrl() {
  const baseUrl = window.location.origin;
  return baseUrl.includes("localhost") ? localEndpoint : productionEndpoint;
}

function createWord(e) {
  e.preventDefault();
  const word = wordElement.value.toLowerCase();
  const definition = definitionElement.value;
  const xhr = new XMLHttpRequest();
  const url = getEndpointUrl();

  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        wordElement.value = "";
        definitionElement.value = "";
        errorMessageElement.innerHTML = "";
        successResultsElement.innerHTML = "";

        const res = JSON.parse(xhr.responseText);
        if (
          !res ||
          !res.numReq ||
          !res.date ||
          !res.totalWords ||
          !res.word ||
          !res.definition
        ) {
          errorMessageElement.innerHTML = failedPostResponseMsg;
          return;
        }

        const numRequestsElement = document.createElement("h3");
        numRequestsElement.innerHTML = numRequestsPostMsg
          .replace("%NUMREQ", res.numReq)
          .replace("%DATE", res.date)
          .replace("%TOTALWORDS", res.totalWords);
        const newEntryElement = document.createElement("h3");
        newEntryElement.innerHTML = newEntryPostMsg
          .replace("%WORD", res.word)
          .replace("%DEFINITION", res.definition);
        successResultsElement.appendChild(numRequestsElement);
        successResultsElement.appendChild(newEntryElement);
      } else {
        successResultsElement.innerHTML = "";
        errorMessageElement.innerHTML = xhr.responseText;
      }
    }
  };
  xhr.send("word=" + word + "&definition=" + definition);
  xhr.onerror = (e) => {
    errorMessageElement.innerHTML = e.responseText;
  };
}

function getDefinition(e) {
  e.preventDefault();
  const word = wordElement.value.toLowerCase();
  const xhr = new XMLHttpRequest();
  const url = `${getEndpointUrl()}?word=${word}`;
  xhr.open("GET", url, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        errorMessageElement.innerText = "";
        searchResultsElement.innerHTML = "";
        const searchedTerm = document.createElement("h3");
        searchedTerm.innerHTML = searchedTermMsg + word;
        const searchedDefinition = document.createElement("h3");
        searchedDefinition.innerHTML = searchedDefinitionMsg + xhr.responseText;
        searchResultsElement.appendChild(searchedTerm);
        searchResultsElement.appendChild(searchedDefinition);
      } else {
        searchResultsElement.innerHTML = "";
        errorMessageElement.innerHTML = xhr.responseText;
      }
    }
  };
  xhr.send();
  xhr.onerror = (e) => {
    errorMessageElement.innerHTML = e.responseText;
  };
}

// Run when the page is loaded
window.onload = () => {
  const pathname = window.location.pathname.replace("/COMP4537/labs/4", "");
  if (pathname.startsWith("/search")) {
    searchWordBtn.addEventListener("click", getDefinition);
  } else if (pathname.startsWith("/store")) {
    createWordBtn.addEventListener("click", createWord);
  }
};
