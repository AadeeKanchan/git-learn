let count = 0;
const countDisplay = document.getElementById("count");

document.getElementById("btn").addEventListener("click", () => {
  count++;
  countDisplay.textContent = count;
  console.log("Work in progress...");
});
document.getElementById("reset-btn").addEventListener("click", () => {
  countDisplay.textContent = 0;
});
