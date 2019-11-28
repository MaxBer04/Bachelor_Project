import express from 'express';
import {verifyToken} from './login.js';
import DBHandler from '../databaseHandler.js';
const router = express.Router();

// This class mainly handles the requests for the search function

router.get('/', verifyToken, async (req,res) => {
  res.render('search', (err, html) => {
    res.send(html);
  });
});

router.get('/confirmed', verifyToken, async (req, res) => {
  // Bei den Modes bedeutet false OR und true AND
  const dbHandler = new DBHandler();
  let searchResults3;
  

  if(!req.query.users && !req.query.sets && !req.query.attributes) {
    searchResults3 = await searchAllAnnotatedSets(dbHandler);
  } else {

    let searchResults = await searchByUserEmails(req.query, dbHandler);
  
    let searchResults2 = await searchBySets(req.query, searchResults, dbHandler);
  
    searchResults3 = await searchByAttributes(req.query, searchResults2, dbHandler);
  }


  
  const usersArray = Array.isArray(req.query.users) ? req.query.users : [req.query.users];
  if(usersArray.length === 1 && usersArray[0]) {
    const userID = await dbHandler.getIDByEmail(usersArray[0])
    for(let i = 0; i < searchResults3.length; i++) {
      for(let k = 0; k < searchResults3[i].annotatedImages.length; k++) {
        searchResults3[i].annotatedImages[k].lastAnnotationDate = (await dbHandler.getAnnotationDateForImage(searchResults3[i].annotatedImages[k].ID, userID)).timestamp;
      }
    }
  }
  
  res.json(searchResults3);
});

async function searchAllAnnotatedSets(dbHandler) {
  const annotatedSets = await dbHandler.getAllAnnotatedSets();
  for(let i = 0; i < annotatedSets.length; i++) {
    annotatedSets[i].annotatedImages = await dbHandler.getAnnotatedImagesFromSet(annotatedSets[i].ID);
  }
  return annotatedSets;
}

async function searchByUserEmails(reqQuery, dbHandler) {
  let searchResults;
  if(reqQuery.users) {
    const mode = reqQuery.userMode === 'true' ? 'AND' : 'OR';
    let users = reqQuery.users;
    if(!Array.isArray(users)) users = [users];
    searchResults = await dbHandler.getSetsByUserAnnotations(users, mode);
    removeDuplicates(searchResults);
  }
  return searchResults;
}

function removeDuplicates(setList) {
  setList = setList.filter((set, index, self) => 
    index === self.findIndex((foundSet) => {
      foundSet.ID === set.ID;
    })
  );
}

async function searchBySets(reqQuery, userSearchResults, dbHandler) {
  let searchResults2 = userSearchResults;
  if(reqQuery.sets) {
    searchResults2 = [];
    let sets = reqQuery.sets;
    if(!Array.isArray(reqQuery.sets)) sets = [reqQuery.sets];
    if(userSearchResults) {
      for(let i = 0; i < sets.length; i++) {
        for(let k = 0; k < userSearchResults.length; k++) {
          if(Number(userSearchResults[k].ID) === Number(sets[i])) {
            searchResults2.push(userSearchResults[k]);
          }
        }
      }
    } else {
      searchResults2 = await dbHandler.getSetsByID(sets);
    }
  }
  // in searchResults2 sind nur die Sets, auf welchen die User Annotationen vorgenommen haben
  if(searchResults2) {
    const userMode = reqQuery.userMode === 'true' ? 'AND' : 'OR';
    let userEmails = reqQuery.users;
    if(!Array.isArray(userEmails)) userEmails = [userEmails];
    for(let i = searchResults2.length - 1; i >= 0; i--) {
      // annotierte Bilder vom Set laden
      if(userEmails[0]) {
        // Es werden nur Annotationen der ausgewählten User gesucht
        // Dafür IDs der User ermitteln
        let userIDs = await dbHandler.getIDsFromEmails(userEmails);
        userIDs.forEach((IDobj, index) => {
          userIDs[index] = IDobj.ID;
        });
        searchResults2[i].annotatedImages = await dbHandler.getAnnotatedImagesFromUsers(userIDs, searchResults2[i].ID, userMode);
        if(searchResults2[i].annotatedImages.length === 0) searchResults2.splice(i, 1);
        else {
          for(let l = 0; l < searchResults2[i].annotatedImages.length; l++) {
            let image = searchResults2[i].annotatedImages[l];
            image.annotations = [];
            for(let k = 0; k < userIDs.length; k++) {
              let annotations = await dbHandler.getAnnotationsFromImage(userIDs[k], image.ID);
              if(await dbHandler.isImageAnnotatedByUser(userIDs[k], image.ID)) image.annotations = image.annotations.concat(annotations);
            }
          }
        }
      } else {
        // Es werden alle Annotationen des Sets gesucht
        searchResults2[i].annotatedImages = await dbHandler.getAnnotatedImagesFromSet(searchResults2[i].ID);
        for(let l = 0; l < searchResults2[i].annotatedImages.length; l++) {
          let image = searchResults2[i].annotatedImages[l];
          image.annotations = await dbHandler.getAllAnnotationsFromImage(image.ID);
        }
      }
    }
  }
  return searchResults2;
}

async function searchByAttributes(reqQuery, setsSearchResults, dbHandler) {
  if(reqQuery.attributes) {
    const mode = reqQuery.attributesMode === 'true' ? 'AND' : 'OR';
    let attributes = reqQuery.attributes;
    if(!Array.isArray(reqQuery.attributes)) attributes = [reqQuery.attributes];
    if(setsSearchResults) {
      // Alle Attribute für die Bilder aus der Datenbank holen
      for(let k = 0; k < setsSearchResults.length; k++) {
        for(let m = 0; m < setsSearchResults[k].annotatedImages.length; m++) {
          for(let l = 0; l < setsSearchResults[k].annotatedImages[m].annotations.length; l++) {
            let currentAnnotation = setsSearchResults[k].annotatedImages[m].annotations[l];
            currentAnnotation.attributes = await dbHandler.getAttributesFromAnnotation(currentAnnotation.ID);
          }
        }
      }
      // Nach Attributen Filtern
      for(let k = setsSearchResults.length - 1; k >= 0; k--) {
        for(let m = setsSearchResults[k].annotatedImages.length - 1; m >= 0; m--) {
          for(let l = setsSearchResults[k].annotatedImages[m].annotations.length - 1; l >= 0; l--) {
            let currentAnnotation = setsSearchResults[k].annotatedImages[m].annotations[l];
            const temporaryAttributes = [].concat(attributes);
            currentAnnotation.attributes.forEach((attribute) => {
              for(let y = temporaryAttributes.length - 1; y >= 0 ; y--) {
                if(attribute.text === temporaryAttributes[y]) temporaryAttributes.splice(y, 1);
              }
            });
            if(mode === 'AND') {
              // Checken, ob noch Attribute im temporären Array sind, wenn ja kommen diese in den Annotationen des Bilds nicht vor => Bild entfernen
              if(temporaryAttributes.length > 0) setsSearchResults[k].annotatedImages[m].annotations.splice(l, 1);
            } else {
              // Checken, ob mindestens ein Attribut entfernt wurde, wenn nicht, Bild entfernen
              if(temporaryAttributes.length === attributes.length) setsSearchResults[k].annotatedImages[m].annotations.splice(l, 1);
            }
          }
          // Checken, ob ein Bild keine Annotationen mehr hat, also die Suchkriterien nicht erfüllt => entfernen
          if(setsSearchResults[k].annotatedImages[m].annotations.length === 0) setsSearchResults[k].annotatedImages.splice(m, 1);
        }
        // Checken, ob ein Set keine Bilder mehr enthält, also die Suchkriterien nicht erfüllt => entfernen
        if(setsSearchResults[k].annotatedImages.length === 0) setsSearchResults.splice(k, 1);
      }
      return setsSearchResults;
    } else {
      let searchResults3 = [];
      let matchedAnnotationIDs;
      // Get IDs für Annotationen zu den Attributen
      let annotationIDs = []
      for(let i = 0; i < attributes.length; i++) {
        let parsedAnnotationIDs = await dbHandler.getAnnotationIDsByText(attributes[i]);
        parsedAnnotationIDs.forEach((IDobj, index) => {
          parsedAnnotationIDs[index] = IDobj.annotationID;
        });
        annotationIDs.push(parsedAnnotationIDs);
      }
      if(mode === 'AND') {
        // match annotationIDs
        matchedAnnotationIDs = annotationIDs.shift().filter((e1) => {
          return annotationIDs.every((e2) => {
            return e2.indexOf(e1) !== -1;
          });
        });
      } else {
        let allAnnotationIDs = [].concat.apply([], annotationIDs);
        matchedAnnotationIDs = [...new Set(allAnnotationIDs)];
      }
      // Get annotations
      let annotationObjects = await dbHandler.getAnnotationsByIDs(matchedAnnotationIDs);
      // Get images
      let images = [];
      for(let k = 0; k < annotationObjects.length; k++) {
        let foundImage = await dbHandler.getImageFromAnnotationID(annotationObjects[k].ID);
        if(images.some((image) => image.ID === foundImage.ID)) {
          // Bild schon enthalten
          images.forEach((image) => {
            if(image.ID === foundImage.ID) image.annotations.push(annotationObjects[k]);
          });
        } else {
          foundImage.annotations = [annotationObjects[k]];
          images.push(foundImage);
        }
      }
      // Get Sets
      for(let y = 0; y < images.length; y++) {
        let foundSet = await dbHandler.getSetByImageID(images[y].ID);
        if(searchResults3.some((set) => set.ID === foundSet.ID)) {
          // Set schon enthalten
          searchResults3.forEach((set) => {
            if(set.ID === foundSet.ID) set.annotatedImages.push(images[y]);
          });
        } else {
          foundSet.annotatedImages = [images[y]];
          searchResults3.push(foundSet);
        }
      }
      return searchResults3;
    }
  } else {
    return setsSearchResults;
  }
}

export default router;