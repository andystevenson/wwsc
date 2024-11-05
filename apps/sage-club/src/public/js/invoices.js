console.log("invoices.js loaded");

// pdfjs.GlobalWorkerOptions.workerSrc = "./js/pdf.worker.mjs";

const button = document.querySelector(".upload button");
const input = document.querySelector(".upload input[type=file]");

button?.addEventListener("click", () => {
  input?.click();
});

input?.addEventListener("change", () => {
  let files = [];

  for (let i = 0; i < input.files.length; i++) {
    files.push(input.files[i]);
  }

  let fd = new FormData();
  files.forEach((file, i) => {
    fd.append(`files`, file, file.name);
  });

  fetch("/sage/purchase-invoices", {
    // fetch("https://httpbin.org/post", {
    method: "POST",
    body: fd,
  })
    .then((response) => response.json())
    .then((res) => {
      console.log({ res });
    });
  console.log({ fd });
});
