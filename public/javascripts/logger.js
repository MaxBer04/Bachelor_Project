let waitLoginAnimation = false;
let switched = false;

export function initialize() {
  
  document.getElementById("login").addEventListener("click", (evt) => {
    if(!switched) {
      loginToSignUpSwitch();
      addAnimationsToInputFields();
      switched = true;
    } else {
      signUpToLoginSwitch();
      switched = false;
    }
  });

  document.getElementsByClassName("logbtn")[0].addEventListener("click", (evt) => {
    const logBtn = document.getElementsByClassName("logbtn")[0];
    evt.preventDefault();
    if(logBtn.value === "Login") {
      const user = {
        username: document.querySelector('input[type="text"]').value,
        password: document.querySelector('input[type="password"]').value
      }
      logIn(user);
    } else {
      const newUser = {
        username: document.querySelector("#usernameBox input").value,
        password: document.querySelector("#passwordBox input").value,
        passwordConfirm: document.querySelector("#passwordConfirm input").value,
        firstName: document.querySelector("#first_name input").value,
        lastName: document.querySelector("#last_name input").value
      }
      signUp(newUser);
    }
  });
  addAnimationsToInputFields();
}

function logIn(user) {
  const errors = frontendValidation(user);
  if(errors.length === 0) {
    backendValidation(user).then((result) => result).catch((error) => {throw error;})
      .then((result) => {
        if(result) {
          animateSuccesfullLogin(false);
          setTimeout(() => window.location = "main",1000);
        }
      }).catch((error) => {throw error;});
  } else {
    animateWrongLogin(errors);
  }
}

function signUp(user) {
  const errors = fontendValidationSignUp(user);
  if(errors.length === 0) {
    backendValidationSignUp(user).then((result) => result).catch((error) => {throw error;})
    .then((result) => {
      if(result) {
        animateSuccesfullLogin(true);
        setTimeout(() => window.location = "main",1000);
      }
    }).catch((error) => {throw error;});
  } else {
    animateWrongLogin(errors);
  }
}

function frontendValidation(user) {
  const errors = [];
  if(user.username === "") errors.push("usernameBox");
  if(user.password === "") errors.push("passwordBox");
  return errors;
}

function backendValidation(user) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", "/login/loginAttempt", true);
    request.setRequestHeader("username", user.username);
    request.setRequestHeader("password", user.password);
    request.onreadystatechange = function() {
      if(request.readyState === XMLHttpRequest.DONE) {
        const status = request.getResponseHeader("status");
        if(status !== "success") {
          animateWrongLogin([status]);
          resolve(false);
        }
        resolve(true);
      }
    };
    request.send();
  });
}

function fontendValidationSignUp(user) {
  const errors = [];
  Object.keys(user).forEach((key, index) => {
    if(!user[key]) {
      switch (key) {
        case 'username': errors.push("usernameBox"); break;
        case 'password': errors.push("passwordBox"); break;
        case 'passwordConfirm': errors.push("passwordConfirm"); break;
        case 'firstName': errors.push("first_name"); break;
        case 'lastName': errors.push("last_name"); break;
      }
    }
    if(user["password"] !== user["passwordConfirm"] && !errors.includes("passwordConfirm")) errors.push("passwordConfirm");
  });
  return errors;
}

function backendValidationSignUp(user) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", "/login/signUp", true);
    request.setRequestHeader("username", user.username);
    request.setRequestHeader("password", user.password);
    request.setRequestHeader("firstName", user.firstName);
    request.setRequestHeader("lastName", user.lastName);
    request.onreadystatechange = function() {
      if(request.readyState === XMLHttpRequest.DONE) {
        const status = request.getResponseHeader("status");
        if(status !== "success") {
          animateWrongLogin([status]);
          resolve(false);
        }
        resolve(true);
      }
    };
    request.send();
  });
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
  errors.forEach((wrongInputField) => {
    const field = document.getElementById(wrongInputField);
    if(field) {
      field.classList.add("inputWrong");
      field.classList.add("inputWrongColor");
      setTimeout(() => {field.classList.add("inputWrongColor2");}, 300); 
      setTimeout(() => {
        field.classList.remove("inputWrong");
        field.classList.remove("inputWrongColor");
        field.classList.remove("inputWrongColor2");
      }, 790);
    }
  });
}

function animateSuccesfullLogin(withFade) {
  return new Promise((resolve, reject) => {
    document.getElementsByClassName("logbtn")[0].classList.add("success");
    if(withFade) {
      setTimeout(() => {
        document.getElementsByClassName("login-form")[0].classList.add("hide");
        document.getElementsByClassName("signUp-ok-container")[0].classList.add("show");
      }, 100);
    }
    setTimeout(() => {}, 1000);
    resolve();
  });
}

function addAnimationsToInputFields() {
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

function signUpToLoginSwitch() {
  const toggleLogin = document.getElementById("login");
  const bottomText = document.getElementsByClassName("bottom-text")[0];
  const loginForm = document.getElementsByClassName("login-form")[0];
  const logButton = document.getElementsByClassName("logbtn")[0];
  const title = document.querySelector(".login-form h1");


  toggleLogin.innerHTML = "Sign Up"
  bottomText.innerHTML = "Don't have an accout yet? ";
  logButton.value = "Login";
  title.innerHTML = "Login";
  loginForm.classList.remove("bigger");

  loginForm.removeChild(loginForm.childNodes[3]);
  loginForm.removeChild(loginForm.childNodes[3]);
  loginForm.removeChild(loginForm.childNodes[3]);
}

function loginToSignUpSwitch() {
  const toggleLogin = document.getElementById("login");
  const bottomText = document.getElementsByClassName("bottom-text")[0];
  const loginForm = document.getElementsByClassName("login-form")[0];
  const logButton = document.getElementsByClassName("logbtn")[0];
  const title = document.querySelector(".login-form h1");

  toggleLogin.innerHTML = "Login"
  bottomText.innerHTML = "";
  logButton.value = "Sign Up";
  title.innerHTML = "Sign Up";
  loginForm.classList.add("bigger");
  const newInputFields = {
    passwordConfirm: ["passwordConfirm", "Confirm Password"],
    first_name: ["first_name", "First name"],
    last_name: ["last_name", "Last name"]
  }
  let counter = 3;
  Object.keys(newInputFields).forEach((key, index) => {
    const containerDIV = document.createElement("div");
    containerDIV.classList.add("txtb");
    containerDIV.id = newInputFields[key][0];
    const input = document.createElement("input");
    input.setAttribute("type", newInputFields[key][0] === 'passwordConfirm' ? 'password' : 'text');
    containerDIV.appendChild(input);
    const span = document.createElement("span");
    span.setAttribute("data-placeholder", newInputFields[key][1]);
    containerDIV.appendChild(span);
    loginForm.insertBefore(containerDIV, loginForm.childNodes[counter]);
    counter++;
  });
}