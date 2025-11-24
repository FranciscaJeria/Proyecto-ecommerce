const buttonUp = document.getElementById("arriba");

buttonUp.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
