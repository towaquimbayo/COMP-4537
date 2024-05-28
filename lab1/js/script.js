class RemoveBtn {
  constructor(removeCallback) {
    this.removeBtn = document.createElement("button");
    this.removeBtn.className = "removeBtn";
    this.removeBtn.innerHTML = removeBtnText;
    this.removeBtn.onclick = () => {
      this.removeBtn.parentElement.remove(); // remove the note from the DOM
      removeCallback(); // remove the note from the notesList
    };
  }
}

class Note {
  constructor(id, noteMsg, readOnly, removeCallback) {
    this.id = id;
    this.noteMsg = noteMsg;
    this.createNote(noteMsg, readOnly, removeCallback);
  }

  createNote(noteMsg, readOnly, removeCallback) {
    const note = document.createElement("div");
    note.className = "note";
    const noteContainer = document.createElement("div");
    noteContainer.className = "noteContainer";
    noteContainer.contentEditable = !readOnly;
    noteContainer.textContent = noteMsg;

    if (!readOnly) {
      // Chat-GPT generated code: Prevent pasting formatted text
      noteContainer.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertHTML", false, text);
      });

      // update the noteMsg when the user stops typing
      noteContainer.addEventListener("input", () => {
        this.noteMsg = noteContainer.textContent;
      });
    }

    note.appendChild(noteContainer);

    if (!readOnly) {
      // If the note is not read only, add the remove button
      note.appendChild(new RemoveBtn(removeCallback).removeBtn);
    }

    document.getElementById("notesList").appendChild(note);

    return note;
  }
}

class NotesList {
  constructor(readOnly = true) {
    this.notesList = [];
    this.readOnly = readOnly;
    this.clear();
  }

  add(note) {
    this.notesList.push(note);
  }

  remove(noteId) {
    const index = this.notesList.findIndex((note) => note.id === noteId);
    if (index > -1) this.notesList.splice(index, 1);
  }

  clear() {
    this.notesList = [];
    document.getElementById("notesList").innerHTML = "";
  }

  // check if notes exist in localstorage then prepopulate the notesList
  getNotes() {
    const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    if (storedNotes.length === 0) return;
    storedNotes.forEach((note) => {
      const { id, noteMsg } = note;
      this.add(new Note(id, noteMsg, this.readOnly, () => this.remove(id)));
    });
  }
}

function getCurrentTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
}

// If on production, redirect to the base url
// else, redirect to the root
function returnHome() {
  const origin = window.location.origin;
  const baseUrl = window.location.origin + "/COMP4537/labs/1/";
  window.location.href = origin.includes("towaquimbayo.com") ? baseUrl : "/";
}

function renderWriterPage() {
  const writeUpdateTimeDom = document.getElementById("writeUpdateTime");
  document.getElementById("homeBtn").innerHTML = homeBtnText;
  const notesList = new NotesList(false);
  notesList.getNotes(); // prepopulate the notesList

  const addNoteBtn = document.getElementById("addNoteButton");
  addNoteBtn.innerHTML = addNoteBtnText;
  addNoteBtn.addEventListener("click", () => {
    const noteId = Date.now().toString(); // Chat-GPT generated code: Generate a unique id
    notesList.add(new Note(noteId, "", false, () => notesList.remove(noteId)));
  });

  setInterval(() => {
    localStorage.setItem("notes", JSON.stringify(notesList.notesList));
    writeUpdateTimeDom.innerHTML = storedAtText + getCurrentTime();
  }, 2000);
}

function renderReaderPage() {
  const readUpdateTimeDom = document.getElementById("readUpdateTime");
  document.getElementById("homeBtn").innerHTML = homeBtnText;
  const notesList = new NotesList();
  notesList.getNotes(); // prepopulate the notesList

  setInterval(() => {
    notesList.clear();
    notesList.getNotes();
    readUpdateTimeDom.innerHTML = storedAtText + getCurrentTime();
  }, 2000);
}

function renderLandingPage() {
  document.getElementById("landingTitle").innerHTML = landingTitle;
  document.getElementById("landingSubtitle").innerHTML = landingSubtitle;
  document.getElementById("writerBtn").innerHTML = writerBtnText;
  document.getElementById("readerBtn").innerHTML = readerBtnText;
}

// Run when the page is loaded
window.onload = () => {
  const path = window.location.pathname.replace("/COMP4537/labs/1", "");
  switch (path) {
    case "/writer/":
      renderWriterPage();
      break;
    case "/reader/":
      renderReaderPage();
      break;
    default:
      renderLandingPage();
      break;
  }
};
