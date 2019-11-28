let waitLoginAnimation = false;
let switched = false;

// This class handles the client-side javascript logic for the login screen, which is for example sending the login/registration data or checking the data for wrong inputs

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
    const form = document.getElementsByClassName("login-form")[0];
    if(logBtn.value === "Login") {
      const errors = frontendValidation();
      if(errors.length > 0) {
        animateWrongLogin(errors);
        evt.preventDefault();
      }
    } else {
      const errors = frontendValidationSignUp();
      console.log(errors);
      if(errors.length > 0) {
        animateWrongLogin(errors);
        evt.preventDefault();
      }
    }
  });
  addAnimationsToInputFields();
}

function frontendValidation() {
  const errors = [];
  if(!document.querySelector('#usernameBox input').value) errors.push("usernameBox");
  if(!document.querySelector('#passwordBox input').value) errors.push("passwordBox");
  return errors;
}


function frontendValidationSignUp() {
  const errors = [];
  const password = document.querySelector('#passwordBox input').value;
  const confirmPassword = document.querySelector('#passwordConfirm input').value;
  if(!document.querySelector('#usernameBox input').value) errors.push("usernameBox");
  if(!password) errors.push("passwordBox");
  if(!confirmPassword) errors.push("passwordConfirm"); 
  if(!document.querySelector('#first_name input').value) errors.push("first_name");
  if(!document.querySelector('#last_name input').value) errors.push("last_name");
  if(password !== confirmPassword && !errors.includes("passwordConfirm")) errors.push("passwordConfirm");
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

  loginForm.setAttribute("action", "/login/loginAttempt");
  toggleLogin.innerHTML = "Sign Up"
  bottomText.innerHTML = "Don't have an accout yet? ";
  logButton.value = "Login";
  title.innerHTML = "Login";
  loginForm.classList.remove("bigger");

  loginForm.removeChild(loginForm.childNodes[3]);
  loginForm.removeChild(loginForm.childNodes[3]);
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

  loginForm.setAttribute("action", "/login/signUp");
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
    input.setAttribute("name", key);
    containerDIV.appendChild(input);
    const span = document.createElement("span");
    span.setAttribute("data-placeholder", newInputFields[key][1]);
    containerDIV.appendChild(span);
    loginForm.insertBefore(containerDIV, loginForm.childNodes[counter]);
    counter++;
  });
  const adminCheck = document.createElement("input");
  adminCheck.setAttribute("type", "checkbox");
  adminCheck.setAttribute("name", "adminCheck");
  adminCheck.id = "adminCheck";
  const label = document.createElement("label");
  label.innerHTML = "as Admin";
  label.setAttribute("for", "adminCheck");
  loginForm.insertBefore(adminCheck, loginForm.childNodes[6]);
  loginForm.insertBefore(label, loginForm.childNodes[7]);
}