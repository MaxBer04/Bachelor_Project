import * as main from "./index.js";
import * as poly from "./polygon.js";

export class Editor {
  constructor() {
    this._attributeJSON;
    this._fetched = false;
  }
  
  isOpen() {
    return document.getElementsByClassName("polygon-editor")[0].classList.contains("openEditor");
  }

  toggle() {
    const isOpen = this.isOpen();
    const editor = document.getElementsByClassName("polygon-editor")[0];
    const wrapper = document.getElementsByClassName("polygon-wrapper")[0];
    editor.classList.toggle("openEditor");
    wrapper.classList.toggle("openWrapper");
    this.toggleIcon(!isOpen);
    const deleteIcon = document.getElementsByClassName("deletePolygon")[0];
    deleteIcon.classList.toggle("hideIconBySize");
    deleteIcon.classList.toggle("showIcon");
  }

  expand() {
    if(!this.isOpen()) {
      const editor = document.getElementsByClassName("polygon-editor")[0];
      const wrapper = document.getElementsByClassName("polygon-wrapper")[0];
      editor.classList.add("openEditor");
      wrapper.classList.add("openWrapper");
      this.toggleIcon(true);
      const deleteIcon = document.getElementsByClassName("deletePolygon")[0];
      deleteIcon.classList.toggle("hideIconBySize");
      deleteIcon.classList.toggle("showIcon");
    }
  }

  collapse() {
    if(this.isOpen()) {
      const editor = document.getElementsByClassName("polygon-editor")[0];
      const wrapper = document.getElementsByClassName("polygon-wrapper")[0];
      if(editor.classList.contains("openEditor")) editor.classList.remove("openEditor");
      if(wrapper.classList.contains("openWrapper")) wrapper.classList.remove("openWrapper");
      this.toggleIcon(false);
      const deleteIcon = document.getElementsByClassName("deletePolygon")[0];
      deleteIcon.classList.toggle("hideIconBySize");
      deleteIcon.classList.toggle("showIcon");
    }
  }

  toggleIcon(isBeingOpened) {
    const openIcon = document.getElementById("editorOpenIcon");
    const closeIcon = document.getElementById("editorClosedIcon");
    if(isBeingOpened) {
      closeIcon.classList.add("hideIcon");
      openIcon.classList.remove("hideIcon");
    } else {
      openIcon.classList.add("hideIcon");
      closeIcon.classList.remove("hideIcon");
    }
  }

  save() {}
  clear() {
    this.clearAttributesAndText();
    this.correctSelectedOption();
    this.clearOptionList();
  }

  initialize() {
    this.initializeEditorSelect();
    this.initializeTextField();
    this.disableTextField();
  }

  async autocompleteAttributes(inputText) {
    try {
      if(!this._fetched || inputText.length === 1) {
        const res = await fetch("/main/attributes/text");
        this._attributeJSON = await res.json()
        this._fetched = true;
      }
      const attributeArr = [];
      for(let i = 0; i < this._attributeJSON.length; i++) {
        attributeArr.push(this._attributeJSON[i].text);
      }

      const attributesAndCounts = Object.values(attributeArr.reduce( (r,s) => {
        (!r[s]) ? r[s] = {name: s, count: 1} : r[s]['count'] += 1;
        return r;
      }, {} ));

      //const uniqueAttributes = [...(new Set(attributeArr))];
      let matches = attributesAndCounts.filter(attribute => {
        const regex = new RegExp(`^${inputText}`, 'gi');
        return attribute.name.match(regex);
      });
      matches.sort((a,b) => b.count - a.count);
      if(inputText.length === 0) matches = [];

      this.createSuggestions(matches);
    } catch(error) {console.log(error);}
  }

  createSuggestions(matches) {
    const suggestionList = document.getElementsByClassName("suggestions-list")[0];
    this.clearAllChilds(suggestionList);
    matches.forEach((match) => {
      const container = document.createElement("div");
      container.classList.add("attribute-suggestion");
      const text = document.createElement("span");
      text.id = "text";
      text.innerHTML = match.name;
      const count = document.createElement("span");
      count.id = "count";
      count.innerHTML = match.count;
      container.appendChild(text);
      container.appendChild(count);
      const editor = this;
      container.addEventListener("click", (evt) => {
        suggestionList.classList.remove("show");
        editor.addAndDisplayAttribute(container.firstChild.innerHTML);
        editor.clearAllChilds(suggestionList);
        main.boardStateHistory.copyBoardStateToHistory(main.boardState, true, editor.getCurrentlyFocusedPolygon());
      });
      suggestionList.appendChild(container);
    });
  }

  getCurrentlyFocusedPolygon() {
    if(this._optionList.childElementCount === 0 || this._emulatedSelectText.innerHTML == "Select a Polygon: ") return;
    let focusedPolygon;
    main.boardState.currentPolygonCollection.polygons.forEach((polygon) => {
      if(polygon.ID === this._emulatedSelect.ID) focusedPolygon = polygon; 
    });
    return focusedPolygon;
  }

  initializeTextField() {
    const textField = document.getElementsByClassName("text-input")[0];
    const saveTextField = document.getElementById("saveTextInput");
    const editor = this;
    textField.addEventListener("keydown", function(evt){
      if((evt.ctrlKey && (evt.key=="y" || evt.key == "Y")) || (evt.ctrlKey && (evt.key=="z" || evt.key=="Z"))) {
        evt.preventDefault();
      }
    }, false);
    saveTextField.addEventListener("click", (evt) => {
      const poly = editor.getCurrentlyFocusedPolygon();
      if(poly) {
        textField.classList.add("saved");
        poly.text = textField.value;
        main.boardStateHistory.copyBoardStateToHistory(main.boardState, true, editor.getCurrentlyFocusedPolygon());
        setTimeout(() => {textField.classList.remove("saved")}, 2000);
      }
    }, false);
  }

  correctTextField() {
    const poly = this.getCurrentlyFocusedPolygon();
    if(poly) document.getElementsByClassName("text-input")[0].value = poly.text;
  }

  disableTextField() {
    const textField = document.getElementsByClassName("text-input")[0];
    textField.setAttribute("disabled", "disabled");
    textField.setAttribute("style", "cursor: not-allowed");
  }

  enableTextField() {
    const textField = document.getElementsByClassName("text-input")[0];
    textField.removeAttribute("disabled");
    textField.removeAttribute("style");
  }

  initializeEditorSelect() {
    /* Look for any elements with the class "custom-select": */
    this._selectContainer = document.getElementsByClassName("custom-select")[0];
  
    /* Create a new DIV that will act as the selected item: */
    this._emulatedSelect = document.createElement("DIV");
    this._emulatedSelect.setAttribute("class", "select-selected");
    let editor = this;
    this._emulatedSelect.addEventListener("click", function(e) {
      /* When the select box is clicked, close any other select boxes,
      and open/close the current select box: */
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
    });

    this._emulatedSelectText = document.createElement("DIV");
    this._emulatedSelectText.classList.add("selected-text");
    this._emulatedSelectText.innerHTML = "Select a Polygon: ";
    const editor1 = this;
    this._emulatedSelectText.addEventListener("click", function(evt) {
      if(this.hasAttribute("contenteditable")) evt.stopPropagation();
    }, false);
    this._emulatedSelectText.addEventListener("keydown", function(evt) {
      if(evt.keyCode === 13) { // enter
        evt.preventDefault();
        if(this.innerHTML === "") return main.customAlert("The Name must not be empty!");

        const currentPolygon = editor1.getCurrentlyFocusedPolygon();
        if(!currentPolygon) return main.customAlert("Select a Polygon first to change its name!");
        currentPolygon.name = this.innerHTML;

        editor1._optionList.childNodes.forEach((optionDIV) => {
          if(optionDIV.ID === currentPolygon.ID) optionDIV.innerHTML = currentPolygon.name;
        });

        editor1._emulatedSelectText.toggleAttribute("contenteditable");
        main.customAlert("Name changed!");
        main.boardStateHistory.copyBoardStateToHistory(main.boardState, true, editor1.getCurrentlyFocusedPolygon());
        return;
      }
    }, false);

    const selectTextEdit = document.createElement("ion-icon");
    selectTextEdit.id = "selectTextEdit";
    selectTextEdit.setAttribute("name", "create");
    const editor2 = this;
    selectTextEdit.addEventListener("click", function(evt) {
      evt.stopPropagation();
      editor2._emulatedSelectText.toggleAttribute("contenteditable");
      editor2._emulatedSelectText.focus();
    }, false);

    this._emulatedSelect.appendChild(selectTextEdit);
    this._emulatedSelect.appendChild(this._emulatedSelectText);
    this._selectContainer.appendChild(this._emulatedSelect);
  
    /* Create a new DIV that will contain the option list: */
    this._optionList = document.createElement("DIV");
    this._optionList.setAttribute("class", "select-items select-hide");
    this.populateOptionList();
  }

  clearOptionList() {
    this.clearAllChilds(document.getElementsByClassName("select-items")[0]);
  }

  populateOptionList() {
    this.clearAllChilds(this._optionList);
    const polygonList = main.boardState.currentPolygonCollection.polygons;
    for (let j = 0; j < polygonList.length; j++) {
      if(!polygonList[j].finished) continue;
      let emulatedOption = this.createOption(polygonList[j]);
      
      let editor = this;
      emulatedOption.addEventListener("click", function(e) {
        editor.bringOptionInFocus(this);
      });
      this._optionList.appendChild(emulatedOption);
    }
    this._selectContainer.appendChild(this._optionList);
    this.correctSelectedOption();
  }

  removeSelectedOption() {
    main.boardState.currentPolygonCollection.polygons.forEach((pol) => {
      pol.selectedInEditor = false;
    });
    this.clearAttributesAndText();
    this._emulatedSelectText.innerHTML = "Select a Polygon: ";
    this._emulatedSelect.setAttribute("style", "background-color: #ffffff");
    this._emulatedSelect.ID = "";
    this.disableTextField();
  }

  correctSelectedOption(polygon) {
    const currentFocusedPolygon = polygon || this.getCurrentlyFocusedPolygon();
    if(!currentFocusedPolygon || (currentFocusedPolygon && !currentFocusedPolygon.finished)) { // kein Ausgeähltes Polygon
      this.removeSelectedOption();
    }
    else {
      const editor4 = this;
      this.enableTextField();
      main.boardState.currentPolygonCollection.polygons.forEach((pol) => {
        if(pol.selectedInEditor) {
          editor4._optionList.childNodes.forEach((optionDIV) => {
            if(optionDIV.ID === pol.ID) editor4.bringOptionInFocus(optionDIV);
          });
        }
      });
    }
  }

  getOptionDIV(polygon) {
    for(let i = 0; i < this._optionList.childNodes.length; i++) {
      if(this._optionList.childNodes[i].ID === polygon.ID) return this._optionList.childNodes[i];
    }
  }


  getOptionDIVByPolygonID(ID) {
    let DIV;
    this._optionList.childNodes.forEach((optionDIV) => {
      if(optionDIV.ID === ID) DIV = optionDIV;
    });
    return DIV;
  }

  createOption(polygon) {
    let emulatedOption = document.createElement("DIV");
    emulatedOption.innerHTML = polygon.name === "" ? `POLYGON: ${polygon.ID}` : polygon.name;
    emulatedOption.ID = polygon.ID;
    emulatedOption.setAttribute("style", `background-color: ${polygon._useColor}`);
    return emulatedOption;
  }

  bringOptionInFocus(optionDIV) {
    this.closeAllSelect();
    let selectedOption;
    const polygonList = main.boardState.currentPolygonCollection.polygons;
    for (let i = 0; i < polygonList.length; i++) {
      if (polygonList[i].ID === optionDIV.ID) {
        if(document.getElementsByClassName("text-input")[0].hasAttribute("disabled")) this.enableTextField();
        polygonList[i].selectedInEditor = true;
        this._emulatedSelectText.innerHTML = optionDIV.innerHTML;
        this._emulatedSelect.ID = optionDIV.ID;
        selectedOption = this._optionList.getElementsByClassName("same-as-selected")[0];
        if(selectedOption) selectedOption.classList.remove("same-as-selected");
        optionDIV.classList.add("same-as-selected");
        const color = optionDIV.style.backgroundColor;
        this._emulatedSelect.setAttribute("style", `background-color: ${color}`);
        main.newSelectedPolygon(polygonList[i]);
        this.closeAllSelect();
        this.loadAttributesAndText(polygonList[i]);
        break;
      }
    }
  }

  addAndDisplayAttribute(attributeText) {
    const attribute = new poly.Attribute(attributeText);
    if(this.addAttributeToFocusedPolygon(attribute)) this.displayAttribute(attribute);
    console.log(this.getCurrentlyFocusedPolygon().attributes);
    document.getElementById("attributeInput").value= "";
  }

  addAttributeToFocusedPolygon(attribute) {
    const focusedPolygon = this.getCurrentlyFocusedPolygon();
    if(!focusedPolygon) {
      main.customAlert("Please select a Polygon first, to then add attributes to it!");
      return false;
    }
    if(!focusedPolygon.hasAttribute(attribute.content)) {
      focusedPolygon.addAttribute(attribute);
      return true;
    } else return false;
  }

  displayAttribute(attribute) {
    const attributeDIV = this.createAttributeDIV(attribute);
    document.getElementsByClassName("attributes-list")[0].appendChild(attributeDIV);
  }

  clearAttributesAndText() {
    this.clearAllChilds(document.getElementsByClassName("attributes-list")[0]);
    document.getElementsByClassName("text-input")[0].value = "";
  }

  loadAttributesAndText(polygon) {
    document.getElementById("attributeInput").value = "";
    const attributesList = document.getElementsByClassName("attributes-list")[0];
    this.clearAllChilds(attributesList);
    for(let i = 0; i < polygon.attributes.length; i++) {
      const attributeDIV = this.createAttributeDIV(polygon.attributes[i]);
      attributeDIV.setAttribute("style", `background-color: ${polygon._useColor}`);
      attributesList.appendChild(attributeDIV);
    }
    const textInput = document.getElementsByClassName("text-input")[0];
    textInput.value = polygon.text;
  }

  deleteAttributeFromCurrentPolygon(attribute) {
    const currentPolygon = this.getCurrentlyFocusedPolygon();
    currentPolygon.removeAttribute(attribute.ID);
  }

  deleteAttributeFromView(attribute) {
    const attributesList = document.getElementsByClassName("attributes-list")[0];
    attributesList.childNodes.forEach((attributeDIV) => {
      if(attributeDIV.id == attribute.ID) {
        attributesList.removeChild(attributeDIV);
        return;
      }
    });
  }

  createAttributeDIV(attribute) {
    const attributeDIV = document.createElement("DIV");
    attributeDIV.setAttribute("id", attribute.ID);
    attributeDIV.setAttribute("class", "attribute");
    const currentPolygon = this.getCurrentlyFocusedPolygon();
    attributeDIV.setAttribute("style", `background-color: ${currentPolygon._useColor}`);

    const attributeText = document.createElement("DIV");
    attributeText.setAttribute("class", "attribute-text");
    attributeText.setAttribute("contenteditable", "true");
    attributeText.setAttribute("data-id", attribute.ID);
    attributeText.innerHTML = attribute.content;
    attributeText.addEventListener("input", function(evt){
      attribute.preSaveContent = this.innerHTML;
    }, false);
    const editor = this;
    attributeText.addEventListener("keydown", function(evt) {
      if(evt.keyCode === 13) {
        evt.preventDefault();
        const focusedPolygon = editor.getCurrentlyFocusedPolygon();
        if(!focusedPolygon.hasAttribute(attribute.preSaveContent)) {
          attribute.content = attribute.preSaveContent;
          attributeText.innerHTML = attribute.preSaveContent;
          main.customAlert("Attribute changed!");
          main.boardStateHistory.copyBoardStateToHistory(main.boardState, true, editor.getCurrentlyFocusedPolygon());
        } else {
          attributeText.innerHTML = attribute.content;
          main.customAlert("This Annotation has this attribute already!");
        }
      }
    }, false);

    const ionIcon = document.createElement("ion-icon");
    ionIcon.setAttribute("class", "delete-attribute");
    ionIcon.setAttribute("name", "close");
    ionIcon.addEventListener("click", function(evt) {
      editor.deleteAttributeFromCurrentPolygon(attribute);
      editor.deleteAttributeFromView(attribute);
      main.boardStateHistory.copyBoardStateToHistory(main.boardState, true, editor.getCurrentlyFocusedPolygon());
    }, false);

    attributeDIV.appendChild(attributeText);
    attributeDIV.appendChild(ionIcon);

    return attributeDIV;
  }

  clearAllChilds(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  closeAllSelect() {
    /* A function that will close all select boxes */
    this._emulatedSelect.classList.remove("select-arrow-active");
    if(!this._optionList.classList.contains("select-hide")) this._optionList.classList.add("select-hide");
  }
}
