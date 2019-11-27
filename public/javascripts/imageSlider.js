import {customAlert, loadSetIntoApp, loadNewImage, socket} from './index.js';

export class ImageSlider{
  constructor(document) {
    this._arrowRight = document.getElementsByClassName("arrow-right")[0];
    this._arrowLeft = document.getElementsByClassName("arrow-left")[0];
    this._imagesContainer = document.getElementsByClassName("image-slider-images")[0];
    this._imageFiles = [];
    this._IDcounter = 0;
    this._setsObj = {sets: []};
    this._currentPosition = 6;
    this._arrowsInitialized = false;
    this._isSetLoaded = false;
  }

  initialize() {
    this._currentPosition = 6;
    this.clearSlider();
    this._isSetLoaded = false;
  }

  closeUpload() {
    document.getElementsByClassName("uploadScreen")[0].classList.remove("cover");
  }

  closeLoad() {
    if(document.getElementsByClassName("loadScreen")[0].classList.contains("cover"))document.getElementsByClassName("loadScreen")[0].classList.remove("cover");
    if(document.getElementsByClassName("uploadScreenDecision")[0].classList.contains("cover"))document.getElementsByClassName("uploadScreenDecision")[0].classList.remove("cover");
  }

  clearUploadForm() {
    this._imageFiles = [];
    this._IDcounter = 0;
    document.getElementById("imageSetTitle").value = "";
    const imagesContainer = document.getElementsByClassName("uploadImageContainer")[0];
    const nodesToDelete = [];
    imagesContainer.childNodes.forEach((node) => {
      if(node.hasAttribute("id")) nodesToDelete.push(node);
    });
    for(let i = 0; i < nodesToDelete.length; i++) {
      imagesContainer.removeChild(nodesToDelete[i]);
    }
  }

  loadSets() {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', '/main/setPreviews', true);
      const loadedSetIDs = [];
      if(this._setsObj) {
        this._setsObj.sets.forEach((set => loadedSetIDs.push(set.ID)));
      }
      request.setRequestHeader("loadedSetIDs", loadedSetIDs);
      request.onreadystatechange = () => {
        if(request.readyState === 4 && request.status === 200) {
          this.displaySetPreviews(JSON.parse(request.response));
          resolve();
        }
      }
      request.send();
    });
  }

  clearSetsView() {
    const container = document.getElementsByClassName("loadSetContainer")[0];
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  clearSlider() {
    const container = document.getElementsByClassName("image-slider-images")[0];
    while(container.firstChild){
      container.removeChild(container.firstChild);
    }
  }

  loadSetIntoSlider(images, document) {
    this._isSetLoaded = true;
    const imgObserver = new IntersectionObserver((entires, imgObserver) => {
      entires.forEach(entry => {
        if(!entry.isIntersecting) return
        else {
          const src = entry.target.getAttribute("data-src");
          if(src) entry.target.src = src;
          imgObserver.unobserve(entry.target);
        }
      })
    }, {})
    for(let i = 0; i < images.length; i++) {
      const containerDIV = document.createElement("div");
      containerDIV.classList.add("image-container");
      const image = document.createElement("img");
      image.setAttribute("data-ID", images[i].ID);
      image.style.opacity = 0;

      
      containerDIV.appendChild(image);
      if(images[i].annotated) {
        const icon = document.createElement("ion-icon");
        icon.setAttribute("name", "bookmark");
        containerDIV.appendChild(icon);
      }
      this._imagesContainer.appendChild(containerDIV);

      image.addEventListener("load", function () {
        image.style.opacity = 1;
      });
      if(i <= 6) image.src = images[i].path;
      else {
        image.setAttribute("data-src", images[i].path);
        imgObserver.observe(image);
      }
    }
  }

  reDisplaySets(setsObj) {
    this.clearSetsView();
    this.displaySetPreviews(setsObj, true);
  }

  displaySetPreviews(setsObj, redisplay = false) {
    const container = document.getElementsByClassName("loadSetContainer")[0];
    if(!redisplay) setsObj.sets.forEach(set => this._setsObj.sets.push(set));

    for(let i = 0; i < setsObj.sets.length; i++) {
      const setDIV = document.createElement("DIV");
      setDIV.classList.add("set-container");
      setDIV.setAttribute("data-setID", setsObj.sets[i].ID);
      setDIV.addEventListener("click", async (evt) => {
        await loadSetIntoApp(Number(setDIV.getAttribute("data-setID")));
      }, false);

      const folder = document.createElement("ion-icon");
      folder.setAttribute("name", "folder");
      folder.classList.add("imageSet-folder");
      const imgObserver = new IntersectionObserver((entires, imgObserver) => {
        entires.forEach(entry => {
          if(!entry.isIntersecting) return
          else {
            const src = entry.target.getAttribute("data-src");
            if(src) entry.target.src = src;
            imgObserver.unobserve(entry.target);
          }
        })
      }, {})
      for(let k = 0; k < setsObj.sets[i].images.length; k++) {
        const image = new Image();
        image.setAttribute("data-src", setsObj.sets[i].images[k].path);
        imgObserver.observe(image);
        image.style.left = (-5+(k+1)*10)+"px";
        image.style.transform = `rotate(${-15 + (15*k)}deg)`;
        setDIV.append(image);
      }
      const span = document.createElement("span");
      span.innerHTML = setsObj.sets[i].title;

      setDIV.append(span);
      setDIV.append(folder);
      container.append(setDIV);
    }
  }

  addEventListeners() {

    document.getElementById("sortUploadDate").addEventListener("click", (evt) => {
      if(this._setsObj.sets.length > 0) {
        this._setsObj.sets.sort((set1, set2) => {
          return new Date(set2.upload_date) - new Date(set1.upload_date);
        })
        this.reDisplaySets(this._setsObj);
      }
    }, false);

    document.getElementById("sortTitle").addEventListener("click", (evt) => {
      if(this._setsObj.sets.length > 0) {
        this._setsObj.sets.sort((set1, set2) => {
          if(set1.title < set2.title) return -1;
          if(set1.title > set2.title) return 1;
          else return 0;
        })
        this.reDisplaySets(this._setsObj);
      }
    }, false);

    document.getElementsByClassName("dropbtn")[0].addEventListener("click", (evt) => {
      document.getElementById("imageSetDrowdown").classList.toggle("show");
    }, false);

    window.onclick = function(event) {
      if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }

    document.getElementById("submitImageSet").addEventListener("click", (evt) => {
      evt.preventDefault();
      if(document.getElementsByClassName("uploadImageContainer")[0].childNodes.length === 1) {
        customAlert("Select at least one image to upload!");
      } else if(document.getElementById("imageSetTitle").value === "") {
        customAlert("Your set has to have a title!");
      } else {
        customAlert("Images uploading...");
        const formData = new FormData();
        const request = new XMLHttpRequest();
        request.open('POST', '/main/sets', true);
        request.onreadystatechange = () => {
          if (request.readyState == 4 && request.status == 200) {
            customAlert("The image set has been succesfully uploaded!");
            this.clearUploadForm();
            this.closeUpload();
          }
        }
        for(let i = 0; i < this._imageFiles.length; i++) {
          formData.append("images", this._imageFiles[i]);
        }
        formData.append('title', document.getElementById("imageSetTitle").value);
        request.send(formData);
      }
    }, false);

    if(!this._arrowsInitialized) {
      this._arrowsInitialized = true;
      this._arrowRight.addEventListener("click", (evt) => {
        if(this._currentPosition < this._imagesContainer.childNodes.length) {
          this._currentPosition++;
          this._imagesContainer.childNodes.forEach((imageContainer) => {
            let currentPos;
            if(imageContainer.getAttribute("style")) {
            currentPos = Number(imageContainer.getAttribute("style").split("(")[1].split("px")[0]);
            } else {
              currentPos = 0;
            }
            imageContainer.setAttribute("style", `transform: translateX(${currentPos - (this._imagesContainer.offsetWidth/6)}px)`);
          })
        }
      }, false);
      this._arrowLeft.addEventListener("click", (evt) => {
        if(this._currentPosition > 6) {
          this._currentPosition--;
          this._imagesContainer.childNodes.forEach((imageContainer) => {
            let currentPos;
            if(imageContainer.getAttribute("style")) {
            currentPos = Number(imageContainer.getAttribute("style").split("(")[1].split("px")[0]);
            } else {
              currentPos = 0;
            }
            imageContainer.setAttribute("style", `transform: translateX(${currentPos + (this._imagesContainer.offsetWidth/6)}px)`);
          })
        }
      }, false);
      const realEditor = this;
      socket.on('confirmedLock', function(infos){
        realEditor.lockImage(infos);
      });
      socket.on('confirmedUnlock', function(imageID) {
        realEditor.unlockImage(imageID.imageID);
      });
    }
  }
  
  addEventListenerForImages() {
    this._imagesContainer.childNodes.forEach( (imageContainer, index) => {
      imageContainer.addEventListener("click", async (evt) => {
        if(await loadNewImage(imageContainer.firstChild.getAttribute("data-id"), imageContainer.firstChild.src)) {
          if(!imageContainer.classList.contains("active")) {
            imageContainer.classList.add("active");
          }
          this._imagesContainer.childNodes.forEach((i, index2) => {
            if(index2 !== index && i.classList.contains("active")) i.classList.remove("active");
          })
        }
      })
    }, false);
  }


  unlockImage(imageID) {
    try {
      if(this.isImageInLoadedSet(imageID)) {
        const targetImage = document.querySelector(`.image-container img[data-id='${imageID}']`);
        let coverDIV = targetImage.nextElementSibling;
        if(coverDIV) {
          if(!coverDIV.classList.contains("lock")) coverDIV = coverDIV.nextElementSibling;
          targetImage.parentNode.removeChild(coverDIV);
        }
      } 
    } catch(error) {console.error(error)}
  }

  lockImage(infos) {
    if(this.isImageInLoadedSet(infos.imageID)) {
      const targetContainer = document.querySelector(`.image-container img[data-id='${infos.imageID}']`).parentNode;
      const coverDIV = document.createElement("div");
      coverDIV.classList.add("lock");
      coverDIV.addEventListener("click", (evt) => {evt.stopPropagation();})
      const textDIV = document.createElement("div");
      textDIV.classList.add("lock-content");
      textDIV.innerHTML = `Annotated by \n ${infos.firstName.charAt(0)}.${infos.lastName}`;
      coverDIV.appendChild(textDIV);
      targetContainer.appendChild(coverDIV);
    }
  }

  lockImages(socketAnswer) {
    for(let i = 0; i < socketAnswer.length; i++) {
      if(this.isImageInLoadedSet(socketAnswer[i].imageID)) {
        this.lockImage(socketAnswer[i]);
      }
    }
  }

  isImageInLoadedSet(imageID) {
    const imageContainers = document.getElementsByClassName("image-slider-images")[0].childNodes;
    const imageIDs = [];
    for(let i = 0; i < imageContainers.length; i++) {
      imageIDs.push(imageContainers[i].firstChild.getAttribute("data-id"));
    }
    return imageIDs.includes(imageID);
  }

  handleFileUpload(files) {
    if(files && files[0]) {
      Array.from(files).forEach((file) => {
        if(!this._imageFiles.includes(file)) this._imageFiles.push(file);

        const container = document.createElement("div");
        const img = document.createElement("img");
        const deleteIcon = document.createElement("ion-icon");

        img.src = URL.createObjectURL(file);
        deleteIcon.setAttribute("name", "close-circle");
        deleteIcon.classList.add("delete");
        deleteIcon.addEventListener("click", (evt) => {
          document.getElementsByClassName("uploadImageContainer")[0].removeChild(container);
          for(let i = 0; i < this._imageFiles.length; i++) {
            if(this._imageFiles[i] == file) {
              this._imageFiles.splice(i,1);
              break;
            }
          }
        }, false);
        container.classList.add("newImage");
        container.id = ++this._IDcounter;
        container.appendChild(img);
        container.appendChild(deleteIcon);
        document.getElementsByClassName("uploadImageContainer")[0].prepend(container);
      });
    }
  }
}
