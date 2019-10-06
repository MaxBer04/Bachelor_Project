import * as main from "./index.js";


let waitLoginAnimation = false;

export function initialize() {

  document.getElementsByClassName("logbtn")[0].addEventListener("click", (evt) => {
    evt.preventDefault();
    const user = {
      username: document.querySelector('input[type="text"]').value,
      password: document.querySelector('input[type="password"]').value
    }
    const errors = frontendValidation(user);
    if(errors.length === 0) {
      backendValidation(user).then((result) => {
        console.log("ERFOLLLGG");
      }, (error) => {
        console.error(error);
      })
    } else {
      animateWrongLogin(errors);
    }
  });

  Array.from(document.querySelectorAll(".txtb input")).forEach((input) => {
    input.value = "";
    input.addEventListener("focus", function(evt){
      this.classList.add("focus");
    }, false);
  });

  Array.from(document.querySelectorAll(".txtb input")).forEach((input) => {
    input.value = "";
    input.addEventListener("blur", function(evt){
      if(this.value == "") this.classList.remove("focus");
    }, false);
  });
}

function backendValidation(user) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", "/login/loginAttempt", true);
    request.setRequestHeader("username", user.username);
    request.setRequestHeader("password", user.password);
    request.onreadystatechange = function() {
      if(request.readyState === XMLHttpRequest.DONE) {
        if(handleLoginStatus(request.getResponseHeader("status"))) resolve();
        else reject();
      }
    };
    request.send();
  });
}

function handleLoginStatus(status) {
  if(status === "failed") {
    animateWrongLogin(["username", "password"]);
    return false;
  }
  else if(status === "failedOnUsername") {
    animateWrongLogin(["username"]);
    return false;
  }
  else if(status === "failedOnPassword") {
    animateWrongLogin(["password"]);
    return false;
  }
  else return true;
}

function frontendValidation(user) {
  const errors = [];
  if(user.username === "") errors.push("username");
  if(user.password === "") errors.push("password");
  return errors;
}

function animateWrongLogin(errors) {
  if(errors.length > 0 && !waitLoginAnimation) {
    waitLoginAnimation = true;
    const logButton = document.getElementsByClassName("logbtn")[0];
    const bg = logButton.style.background;
    logButton.style.background = "rgba(0,0,0,0)";
    logButton.style.backgroundColor = "rgb(255, 65, 54)";
    setTimeout(() => {
      logButton.style.background = bg;
      waitLoginAnimation = false;
    }, 600);
  }
  if(errors.includes("username")) {
    const usernameInput = document.getElementById("usernameBox");
    usernameInput.classList.add("inputWrong");
    usernameInput.classList.add("inputWrongColor");
    setTimeout(() => {usernameInput.classList.add("inputWrongColor2");}, 300); 
    setTimeout(() => {
      usernameInput.classList.remove("inputWrong");
      usernameInput.classList.remove("inputWrongColor");
      usernameInput.classList.remove("inputWrongColor2");
    }, 790);
  }
  if(errors.includes("password")) {
    const passwordInput = document.getElementById("passwordBox");
    passwordInput.classList.add("inputWrong");
    passwordInput.classList.add("inputWrongColor");
    setTimeout(() => {passwordInput.classList.add("inputWrongColor2");}, 400); 
    setTimeout(() => {
      passwordInput.classList.remove("inputWrong");
      passwordInput.classList.remove("inputWrongColor");
      passwordInput.classList.remove("inputWrongColor2");
    }, 790);
  }
}