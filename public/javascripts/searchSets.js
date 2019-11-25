import * as displaySets from './displaySearchedSets.js';

export class SearchSets {
  constructor(document) {
    this.initiateEventListeners(document);
    this._usersFetched = false;
    this._setsFetched = false;
    this._attributesFetched = false;
    this._userJSON;
    this._setsJSON;
    this._attributeJSON;
    this._searchCriteria = {
      users: [],
      sets: [],
      attributes: []
    }
  }

  initiateEventListeners(document) {
    const searchSetsObj = this;
    const userSearch = document.getElementById("searchByUsers");
    const setSearch = document.getElementById("searchBySets");
    const attributeSearch = document.getElementById("searchByAttributes");
    const switches = document.getElementsByClassName("andorswitch");

    for(let i = 0; i < switches.length; i++) {
      switches[i].addEventListener("click", (evt) => {
        if(switches[i].firstChild.checked == false) {
          switches[i].firstChild.checked = true; 
        }
        else {
          if(switches[i].firstChild.checked == true) {
            switches[i].firstChild.checked = false; 
          }   
        }
      });
    }

    document.getElementById("searchSettingsSearch").addEventListener("click", async (evt) => {
      searchSetsObj.userMode = document.getElementById("usersSwitch").checked;
      searchSetsObj.attributesMode = document.getElementById("attributesSwitch").checked;
      const displaySetsObj = new displaySets.displaySearchedSets(document);
      console.time();
      await displaySetsObj.displaySets(searchSetsObj);
      console.timeEnd();
    }, false);

    userSearch.addEventListener("input", async (evt) => {
      document.getElementById("searchItemsUsersSuggestions").classList.add("show");
      await searchSetsObj.autocompleteUserSuggestions(userSearch.value);
    }, false);
  
    userSearch.addEventListener("onblur", (evt) => {
      document.getElementById("searchItemsUsersSuggestions").classList.remove("show");
      editor._usersFetched = false;
    }, false);

    setSearch.addEventListener("input", async (evt) => {
      document.getElementById("searchItemsSetsSuggestions").classList.add("show");
      await searchSetsObj.autocompleteSetSuggestions(setSearch.value);
    }, false);
  
    setSearch.addEventListener("onblur", (evt) => {
      document.getElementById("searchItemsSetsSuggestions").classList.remove("show");
      editor._setsFetched = false;
    }, false);

    attributeSearch.addEventListener("input", async (evt) => {
      document.getElementById("searchItemsAttributesSuggestions").classList.add("show");
      await searchSetsObj.autocompleteAttributeSuggestions(attributeSearch.value);
    }, false);
  
    setSearch.addEventListener("onblur", (evt) => {
      document.getElementById("searchItemsAttributesSuggestions").classList.remove("show");
      editor._attributesFetched = false;
    }, false);
  }



  async autocompleteAttributeSuggestions(inputText) {
    try {
      if(!this._setsFetched || inputText.length === 1) {
        const res = await fetch("/main/attributes");
        this._attributeJSON = await res.json();
        this._attributesFetched = true;
      }

      const attributeArr = [];
      for(let i = 0; i < this._attributeJSON.length; i++) {
        attributeArr.push(this._attributeJSON[i].text);
      }

      const attributesAndCounts = Object.values(attributeArr.reduce( (r,s) => {
        (!r[s]) ? r[s] = {text: s, count: 1} : r[s]['count'] += 1;
        return r;
      }, {} ));

      let matches = attributesAndCounts.filter(attribute => {
        const regex = new RegExp(`^${inputText}`, 'gi');
        return attribute.text.match(regex);
      });
      matches.sort((a,b) => b.count - a.count);
      if(inputText.length === 0) matches = [];

      this.createAttributeSuggestions(matches);
    } catch(error) {console.error(error);}
  }

  createAttributeSuggestions(matches) {
    const suggestionList = document.getElementById("searchItemsAttributesSuggestions");
    this.clearAllChilds(suggestionList);
    matches.forEach((match) => {
      const container = document.createElement("div");
      container.classList.add("suggestion");
      const text = document.createElement("span");
      text.id = "text";
      text.innerHTML = `${match.text}`;
      const count = document.createElement("span");
      count.id = "count";
      count.innerHTML = match.count;
      container.appendChild(text);
      container.appendChild(count);
      const searchSetsObj = this;
      container.addEventListener("click", (evt) => {
        suggestionList.classList.remove("show");
        searchSetsObj.addAndDisplayAttributeItem(match);
        searchSetsObj.clearAllChilds(suggestionList);
        document.getElementById("searchByAttributes").value = '';
      });
      suggestionList.appendChild(container);
    });
  }

  addAndDisplayAttributeItem(attribute) {
    if(!this.isAttributeAlreadySelected(attribute)) {
      this._searchCriteria.attributes.push(attribute.text);
  
      const attributeItems = document.getElementById("searchItemsAttributes");
  
      const resultItem = document.createElement("div");
      resultItem.classList.add("result-item");
  
      const resultItemText = document.createElement("span");
      resultItemText.classList.add("result-item-text");
      resultItemText.innerHTML = attribute.text;
  
      const ionIcon = document.createElement("ion-icon");
      ionIcon.setAttribute("class", "result-item-delete");
      ionIcon.setAttribute("name", "close");
      const searchSetsObj = this;
      ionIcon.addEventListener("click", function(evt) {
        searchSetsObj.deleteAttributeItem(attribute);
      }, false);
  
      resultItem.appendChild(resultItemText);
      resultItem.appendChild(ionIcon);
      attributeItems.appendChild(resultItem);
    }
  }

  isAttributeAlreadySelected(attribute) {
    const index = this._searchCriteria.attributes.indexOf(attribute.text);
    return index !== -1 ? true : false;
  }

  deleteAttributeItem(attribute) {
    const index = this._searchCriteria.attributes.indexOf(attribute.text);
    if(index !== -1) this._searchCriteria.attributes.splice(index, 1);

    const attributeItems = document.getElementById("searchItemsAttributes");
    attributeItems.childNodes.forEach((resultItem) => {
      if(resultItem.firstChild.innerHTML === attribute.text) {
        attributeItems.removeChild(resultItem);
        return;
      }
    });
  }

  async autocompleteSetSuggestions(inputText) {
    try {
      if(!this._setsFetched || inputText.length === 1) {
        const res = await fetch("/main/sets");
        this._setsJSON = await res.json();
        this._setsFetched = true;
      }

      let matches = this._setsJSON.filter(set => {
        const regex = new RegExp(`^${inputText}`, 'gi');
        return set.title.match(regex);
      });
      if(inputText.length === 0) matches = [];
      this.createSetSuggestions(matches);
    } catch(error) {console.error(error);}
  }

  createSetSuggestions(matches) {
    const suggestionList = document.getElementById("searchItemsSetsSuggestions");
    this.clearAllChilds(suggestionList);
    matches.forEach((match) => {
      const container = document.createElement("div");
      container.classList.add("suggestion");
      const text = document.createElement("span");
      text.id = "text";
      text.innerHTML = `${match.title}`;
      container.appendChild(text);
      const searchSetsObj = this;
      container.addEventListener("click", (evt) => {
        suggestionList.classList.remove("show");
        searchSetsObj.addAndDisplaySetItem(match);
        searchSetsObj.clearAllChilds(suggestionList);
        document.getElementById("searchBySets").value = '';
      });
      suggestionList.appendChild(container);
    });
  }

  addAndDisplaySetItem(set) {
    if(!this.isSetAlreadySelected(set)) {
      this._searchCriteria.sets.push(set.ID);
  
      const setItems = document.getElementById("searchItemsSets");
  
      const resultItem = document.createElement("div");
      resultItem.classList.add("result-item");
      resultItem.setAttribute("data-setID", set.ID);
  
      const resultItemText = document.createElement("span");
      resultItemText.classList.add("result-item-text");
      resultItemText.innerHTML = set.title;
  
      const ionIcon = document.createElement("ion-icon");
      ionIcon.setAttribute("class", "result-item-delete");
      ionIcon.setAttribute("name", "close");
      const searchSetsObj = this;
      ionIcon.addEventListener("click", function(evt) {
        searchSetsObj.deleteSetItem(set);
      }, false);
  
      resultItem.appendChild(resultItemText);
      resultItem.appendChild(ionIcon);
      setItems.appendChild(resultItem);
    }
  }

  isSetAlreadySelected(set) {
    const index = this._searchCriteria.sets.indexOf(set.ID);
    return index !== -1 ? true : false;
  }

  deleteSetItem(set) {
    const index = this._searchCriteria.sets.indexOf(set.ID);
    if(index !== -1) this._searchCriteria.sets.splice(index, 1);

    const setItems = document.getElementById("searchItemsSets");
    setItems.childNodes.forEach((resultItem) => {
      if(Number(resultItem.getAttribute("data-setID")) === set.ID) {
        setItems.removeChild(resultItem);
        return;
      }
    });
  }

  async autocompleteUserSuggestions(inputText) {
    try {
      if(!this._usersFetched || inputText.length === 1) {
        const res = await fetch("/main/users");
        this._userJSON = await res.json();
        this._usersFetched = true;
      }

      let matches = this._userJSON.filter(user => {
        const regex = new RegExp(`^${inputText}`, 'gi');
        return user.email.match(regex) || user.last_name.match(regex) || user.first_name.match(regex);
      });
      if(inputText.length === 0) matches = [];
      this.createUserSuggestions(matches);
    } catch(error) {console.error(error);}
  }

  createUserSuggestions(matches) {
    const suggestionList = document.getElementById("searchItemsUsersSuggestions");
    this.clearAllChilds(suggestionList);
    matches.forEach((match) => {
      const container = document.createElement("div");
      container.classList.add("suggestion");
      const text = document.createElement("span");
      text.id = "text";
      text.innerHTML = `${match.first_name.charAt(0)}. ${match.last_name}   
      (${match.email})`;
      container.appendChild(text);
      const searchSetsObj = this;
      container.addEventListener("click", (evt) => {
        suggestionList.classList.remove("show");
        searchSetsObj.addAndDisplayUserItem(match.email);
        searchSetsObj.clearAllChilds(suggestionList);
        document.getElementById("searchByUsers").value = '';
      });
      suggestionList.appendChild(container);
    });
  }

  addAndDisplayUserItem(email) {
    if(!this.isUserAlreadySelected(email)) {
      this._searchCriteria.users.push(email);
  
      const userItems = document.getElementById("searchItemsUsers");
  
      const resultItem = document.createElement("div");
      resultItem.classList.add("result-item");
  
      const resultItemText = document.createElement("span");
      resultItemText.classList.add("result-item-text");
      resultItemText.innerHTML = email;
  
      const ionIcon = document.createElement("ion-icon");
      ionIcon.setAttribute("class", "result-item-delete");
      ionIcon.setAttribute("name", "close");
      const searchSetsObj = this;
      ionIcon.addEventListener("click", function(evt) {
        searchSetsObj.deleteUserItem(email);
      }, false);
  
      resultItem.appendChild(resultItemText);
      resultItem.appendChild(ionIcon);
      userItems.appendChild(resultItem);
    }
  }

  isUserAlreadySelected(email) {
    const index = this._searchCriteria.users.indexOf(email);
    return index !== -1 ? true : false;
  }

  deleteUserItem(email) {
    const index = this._searchCriteria.users.indexOf(email);
    if(index !== -1) this._searchCriteria.users.splice(index, 1);

    const userItems = document.getElementById("searchItemsUsers");
    userItems.childNodes.forEach((resultItem) => {
      if(resultItem.firstChild.innerHTML === email) {
        userItems.removeChild(resultItem);
        return;
      }
    });
  }

  clearAllChilds(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
}