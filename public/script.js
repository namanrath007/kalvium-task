// script.js
const socket = io();
let pdfDoc = null;
let pageNum = 1;
let role = "viewer";

// PDF.js setup
const pdfCanvas = document.getElementById("pdfCanvas");
const ctx = pdfCanvas.getContext("2d");

// Load PDF document
async function loadPDF(url) {
  pdfDoc = await pdfjsLib.getDocument(url).promise;
  renderPage(pageNum);
}

function renderPage(num) {
  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale: 1.5 });
    pdfCanvas.width = viewport.width;
    pdfCanvas.height = viewport.height;
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    page.render(renderContext);
    document.getElementById("pageNum").textContent = num;
  });
}

// Handle page navigation
function changePage(newPage) {
  if (pdfDoc && newPage > 0 && newPage <= pdfDoc.numPages) {
    pageNum = newPage;
    renderPage(pageNum);
    if (role === "admin") socket.emit("changePage", pageNum); // Sync if admin
  }
}

document.getElementById("prevPage").addEventListener("click", () => {
  changePage(pageNum - 1);
});

document.getElementById("nextPage").addEventListener("click", () => {
  changePage(pageNum + 1);
});

// Receive role from server
socket.on("setRole", (assignedRole) => {
  role = assignedRole;
  if (role === "viewer") {
    document.getElementById("controls").style.display = "none"; // Hide controls for viewers
  }
});

// Sync page change from server
socket.on("changePage", (page) => {
  if (role === "viewer") {
    pageNum = page;
    renderPage(pageNum);
  }
});

// Load the PDF

loadPDF("/pdf-file.pdf");
