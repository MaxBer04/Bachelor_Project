import {getBoardIfAnnotated} from './index.js';
import * as searchDrawer from './drawForSearch.js';

export class displaySearchedSets {
  constructor(document) {
    this.document = document;
    this._polygonList;
    this._boardState;
    this._selectedImage;
    this._selectedImageID;
    this._drawer = new searchDrawer.drawerForSearch();
    this.addEventListeners();
  }

  addEventListeners() {
    const userSelect = document.querySelector("#userSelect > select");
    const annotationSelect = document.querySelector("#annotationSelect > select")
    const userSelectContainer = document.getElementById("userSelect");
    const styleElem = document.createElement("style");
    styleElem.id = "userDropdownAfter";
    styleElem.innerHTML = "#userSelect::after {top: 30%; border-color:  transparent transparent #f1f1f1 transparent;}"
    document.addEventListener("keydown", (evt) => {
      if(evt.key === "Escape") {
        this.closeAnnotationView();
      }
    }, false);
    const realThis = this;
    annotationSelect.addEventListener("change", (evt) => {
      const selectedOption = annotationSelect.options[annotationSelect.selectedIndex];
      annotationSelect.style.backgroundColor = selectedOption.style.backgroundColor;
      realThis.showNewAnnotation(Number(selectedOption.getAttribute("data-annotationid")));
    }, false);
    userSelect.addEventListener("change", async (evt) => {
      const selectedOption = userSelect.options[userSelect.selectedIndex];
      await this.changeSelectedUser(this._selectedImageID, Number(selectedOption.getAttribute("data-userid")));
    }, false);
  }

  async displaySets(searchSetsObj) {
    const setResults = await this.getSetResults(searchSetsObj);
    this.clearSearchResults();
    if(searchSetsObj._searchCriteria.users.length === 1) this.displayInUserView(setResults);
    else this.displayInSetView(setResults);
  }

  async getSetResults(searchSetsObj) {
    const url = new URL(window.location.protocol+"//"+window.location.host+"/main/search/confirmed");
    const userCriteria = searchSetsObj._searchCriteria.users;
    for(let i = 0; i < userCriteria.length; i++) {
      url.searchParams.append("users", userCriteria[i]);
    }
    const setCriteria = searchSetsObj._searchCriteria.sets;
    for(let i = 0; i < setCriteria.length; i++) {
      url.searchParams.append("sets", setCriteria[i]);
    }
    const attributeCriteria = searchSetsObj._searchCriteria.attributes;
    for(let i = 0; i < attributeCriteria.length; i++) {
      url.searchParams.append("attributes", attributeCriteria[i]);
    }
    url.searchParams.append("userMode", searchSetsObj.userMode);
    url.searchParams.append("attributesMode", searchSetsObj.attributesMode);

    try {
      let response = await (await fetch(url)).json();
      return response;
    } catch(error) {
      console.error(error);
    }
  }

  displayInUserView(setResults) {
    const allImages = [];
    for(let i = 0; i < setResults.length; i++) {
      for(let k = 0; k < setResults[i].annotatedImages.length; k++) {
        allImages.push(setResults[i].annotatedImages[k]);
      }
    }
    const imagesInWeekGroups = Object.values(allImages.reduce((total, image) => {
      const date = new Date(image.lastAnnotationDate);
      const weekNumber = this.getISO8601WeekNo(date);
      if(!total[weekNumber]) {
        total[weekNumber] = {};
        total[weekNumber].weekNumber = weekNumber;
        total[weekNumber].year = date.getFullYear();
        total[weekNumber].images = [];
      }
      total[weekNumber].images.push(image);
      return total;
    }, {}));
    imagesInWeekGroups.sort((b,a) => a.weekNumber == b.weekNumber ? 0 : +(a.weekNumber > b.weekNumber) || -1);

    for(let i = 0; i < imagesInWeekGroups.length; i++) {
      const row = document.createElement("div");
      row.classList.add("content-container");

      const rowTitleContainer = document.createElement("div");
      rowTitleContainer.classList.add("content-container-title");
      const titleText = document.createElement("span");
      titleText.innerHTML = `Week ${imagesInWeekGroups[i].weekNumber}, ${imagesInWeekGroups[i].year}`;
      rowTitleContainer.appendChild(titleText);
      row.appendChild(rowTitleContainer);

      const imagesContainer = document.createElement("div");
      imagesContainer.classList.add("content-container-images");
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
      for(let k = 0; k < imagesInWeekGroups[i].images.length; k++) {
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("content-result-image");
        imageContainer.addEventListener("click", async (evt) => {
          this._selectedImageID = imagesInWeekGroups[i].images[k].ID;
          await this.showAnnotationsForImage(imagesInWeekGroups[i].images[k]);
        });
        const img = new Image();
        img.setAttribute("data-src", imagesInWeekGroups[i].images[k].path);
        imgObserver.observe(img);
        img.setAttribute("data-id", imagesInWeekGroups[i].images[k].ID);
        imageContainer.appendChild(img);
        imagesContainer.appendChild(imageContainer);
      }
      row.appendChild(imagesContainer);
      const resultContainer = document.getElementsByClassName("search-results")[0];
      resultContainer.append(row);
    }
  }
  displayInSetView(setResults) {
    for(let i = 0; i < setResults.length; i++) {
      const row = document.createElement("div");
      row.classList.add("content-container");

      const rowTitleContainer = document.createElement("div");
      rowTitleContainer.classList.add("content-container-title");
      const titleText = document.createElement("span");
      titleText.innerHTML = setResults[i].title;
      rowTitleContainer.appendChild(titleText);
      row.appendChild(rowTitleContainer);

      const imagesContainer = document.createElement("div");
      imagesContainer.classList.add("content-container-images");
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
      for(let k = 0; k < setResults[i].annotatedImages.length; k++) {
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("content-result-image");
        imageContainer.addEventListener("click", async (evt) => {
          this._selectedImageID = setResults[i].annotatedImages[k].ID;
          await this.showAnnotationsForImage(setResults[i].annotatedImages[k]);
        });
        const img = new Image();
        img.setAttribute("data-src", setResults[i].annotatedImages[k].path);
        imgObserver.observe(img);
        img.setAttribute("data-id", setResults[i].annotatedImages[k].ID);
        imageContainer.appendChild(img);
        imagesContainer.appendChild(imageContainer);
      }
      row.appendChild(imagesContainer);
      const resultContainer = document.getElementsByClassName("search-results")[0];
      resultContainer.append(row);
    }
  }

  async showAnnotationsForImage(imageObj) {
    this._selectedImage = imageObj;
    document.getElementsByClassName("cover-search")[0].classList.add("show");
    let userIDToDisplay;
    if(imageObj.annotations) {
      const url = new URL(window.location.protocol+"//"+window.location.host+"/main/users/annotated/"+imageObj.annotations[0].ID);
      try {
        const response = (await (await fetch(url)).json());
        userIDToDisplay = response.userID;
      } catch(error) {
        console.error(error);
      }
    }
    let boardState = await getBoardIfAnnotated(imageObj.ID, userIDToDisplay);
    this._boardState = boardState;
    this.clearAllChilds(document.querySelector("#userSelect > select"));
    const url = new URL(window.location.protocol+"//"+window.location.host+"/main/users/all/annotated/"+imageObj.ID);
    let allUsersThatAnnotatedThisImage = []; 
    try {
      const response = (await (await fetch(url)).json());
      allUsersThatAnnotatedThisImage = response;
    } catch(error) {
      console.error(error);
    }
    this.createUserSelectOptions(allUsersThatAnnotatedThisImage);
    this.bringUserOptionInFocus(userIDToDisplay);
    this.fillAnnotationView(boardState);
  }

  async changeSelectedUser(imageID, userID) {
    let boardState = await getBoardIfAnnotated(imageID, userID);
    this._boardState = boardState;
    this.fillAnnotationView(boardState);
  }

  bringUserOptionInFocus(userIDToDisplay) {
    const userSelect = document.querySelector("#userSelect > select");
    for(let i = 0; i < userSelect.childNodes.length; i++) {
      const option = userSelect.childNodes[i];
      if(Number(option.getAttribute("data-userid")) === userIDToDisplay) option.selected = 'selected';
    }
  }

  createUserSelectOptions(allUsers) {
    const userSelect = document.querySelector("#userSelect > select");
    for(let i = allUsers.length-1; i >= 0 ; i--) {
      const option = document.createElement("option");
      option.innerHTML = allUsers[i].email;
      option.setAttribute("data-userID", allUsers[i].userID);
      userSelect.appendChild(option);
    }
  }

  createPolygonSelectOptions(polygons) {
    const annotationSelect = document.querySelector("#annotationSelect > select");
    this._polygonList = polygons;
    // length -1, because the last one is the unfinished current polygon
    for(let i = 0; i < polygons.length-1; i++) {
      const option = document.createElement("option");
      option.setAttribute("data-annotationID", polygons[i].ID);
      option.innerHTML = polygons[i].name != '' ? polygons[i].name : 'PolygonID '+polygons[i].ID;
      option.style.backgroundColor = polygons[i]._useColor;
      option.style.color = "#000";
      if(i === 0) {
        this.showNewAnnotation(polygons[i].ID);
        annotationSelect.style.backgroundColor = polygons[i]._useColor;
        option.selected = 'selected'
      };
      annotationSelect.appendChild(option);
    }
    
  }

  showNewAnnotation(polygonID) {
    // Get the polygon from the list
    let polygon;
    for(let i = 0; i < this._polygonList.length; i++) {
      if(this._polygonList[i].ID === polygonID) polygon = this._polygonList[i];
    }
    this.changePolygonToDisplay(polygon);
  }

  clearForNewPolygon() {
    this.clearAllChilds(document.getElementsByClassName("attributes-list")[0]);
    document.getElementsByClassName("text")[0].innerHTML = '';
  }

  fillAnnotationView(boardState) {
    this.clearAnnotationView();
    const polygons = boardState._currentPolygonCollection.polygons;
    this.createPolygonSelectOptions(polygons);
  }

  changePolygonToDisplay(newPolygon) {
    this.clearForNewPolygon();
    this.displayAttributes(newPolygon);
    this.displayText(newPolygon);
    for(let i = 0; i < this._boardState._currentPolygonCollection.polygons.length; i++) {
      if(this._boardState._currentPolygonCollection.polygons[i].ID === newPolygon.ID) {
        this._boardState._currentPolygonCollection.polygons[i].selectedInEditor = true;
      } else {
        this._boardState._currentPolygonCollection.polygons[i].selectedInEditor = false;
      }
    }
    this._boardState.selectedInEditor = true;
    this._drawer.reDrawImageAndBoard(this._selectedImage.path, this._boardState); // mark newPolygon as current polygon
  }

  displayAttributes(polygon) {
    const attributeContainer = document.getElementsByClassName("attributes-list")[0];
    const color = polygon._useColor;
    for(let i = 0; i < polygon._attributeList.length; i++) {
      const attribute = document.createElement("div");
      attribute.classList.add("attribute");
      attribute.innerHTML = polygon._attributeList[i]._content;
      attribute.style.backgroundColor = color;
      attributeContainer.appendChild(attribute);
    }
  }

  displayText(polygon) {
    const textArea = document.getElementsByClassName("text")[0];
    textArea.innerHTML = polygon._text;
  }

  clearAnnotationView() {
    this.clearAllChilds(document.querySelector("#annotationSelect > select"));
    this.clearAllChilds(document.getElementsByClassName("attributes-list")[0]);
    document.getElementsByClassName("text")[0].innerHTML = '';
  }

  closeAnnotationView() {
    const coverDiv =  document.getElementsByClassName("cover-search")[0];
    if(coverDiv.classList.contains("show")) coverDiv.classList.remove("show");
  }

  clearAllChilds(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  getISO8601WeekNo(date) {
    var startDate = new Date(date.getFullYear(), 0);
    var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    while (endDate.getDay() < 6) endDate.setDate(endDate.getDate() + 1);
    endDate = endDate.getTime();
    var weekNo = 0;
    while (startDate.getTime() < endDate) {
      if (startDate.getDay() == 4) weekNo++;
      startDate.setDate(startDate.getDate() + 1);
    }
    return weekNo;
  }

  clearSearchResults() {
    const resultsContainer = document.getElementsByClassName("search-results")[0];
    while(resultsContainer.firstChild) {
      resultsContainer.firstChild.remove();
    }
  }
}
