let count = 0;
const countDisplay = document.getElementById("count");

document.getElementById("btn").addEventListener("click", () => {
  count++;
  countDisplay.textContent = count;
});
