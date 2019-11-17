import express from 'express';
import {verifyToken, isAdmin} from './login.js';
import DBHandler from '../databaseHandler.js';
import multer from 'multer';
import atob from 'atob';

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
      cb(null, './uploads')
  }
});
const upload = multer({storage});

const router = express.Router();
const dbHandler = new DBHandler();

router.get('/', verifyToken, async (req, res, next)  => {
  const verified = await dbHandler.isVerified(req.user.ID);
  //const user = await getCookieWithIsAdmin(req.cookies);
  const user = req.user;
  user.verified = verified;
  res.render('main', user, (err, html) => {
    res.send(html);
  });
});

router.get('/users', verifyToken, async (req, res) => {
  const users = await dbHandler.getAllUsers();
  res.json(users);
});

router.get('/attributes', verifyToken, async (req, res) => {
  const attributes = await dbHandler.getAllAttributes();
  res.json(attributes);
});

router.get('/attributes/text', verifyToken, async (req, res) => {
  const attributes = await dbHandler.getAllAttributesText();
  res.json(attributes);
});

router.get("/annotations/:imageID/:userID", verifyToken, async (req, res) => {
  const imageID = req.params.imageID;
  const boardState = {};
  let userIDForAnnotation = req.user.ID;
  if(req.params.userID != 'undefined') {
    userIDForAnnotation = req.params.userID;
  }
  if(await dbHandler.isImageAnnotatedByUser(userIDForAnnotation, imageID)) {
    boardState.polygonCollection = await dbHandler.getAnnotationsFromImage(userIDForAnnotation, imageID);
    for(let i = 0; i < boardState.polygonCollection.length; i++) {
      boardState.polygonCollection[i].attributes = await dbHandler.getAttributesFromAnnotation(boardState.polygonCollection[i].ID);
      boardState.polygonCollection[i].points = await dbHandler.getPointsFromAnnotation(boardState.polygonCollection[i].ID);
    }
  }
  res.json(boardState);
});

router.get("/users/annotated/:annotationID/", verifyToken, async (req, res) => {
  const annotationID = req.params.annotationID;
  const userObject = await dbHandler.getUserIDFromAnnotationID(annotationID);
  res.json(userObject);
});

router.get("/users/all/annotated/:imageID/", verifyToken, async (req, res) => {
  const imageID = req.params.imageID;
  const userIDs = await dbHandler.getAllUserIDsForAnnotatedImage(imageID);
  for(let i = 0; i < userIDs.length; i++) {
    userIDs[i].email = await dbHandler.getEmailByID(userIDs[i].userID);
  }
  res.json(userIDs);
});

router.get('/sets', verifyToken, async (req, res) => {
  const sets = await dbHandler.getAllImageSets();
  res.json(sets);
});

router.post('/sets', verifyToken, isAdmin, upload.array('images'), async (req, res) => {
  if (req.files.length === 0) {
    return res.status(400).send('No files were uploaded.');
  } else {
    try {
      const imageSetID = await dbHandler.createNewImageSet(req.body.title);
      for(const file of req.files){
          const fileURL = "/uploads/"+ file.filename;
          await dbHandler.addImageToImageSet(fileURL, imageSetID, file.mimetype);
      }
    } catch(error) {
      console.error(error);
      res.status(500).send(error);
    }
  }
  res.status(200).send();
});

router.post('/sets/multiple', verifyToken, isAdmin, upload.array('images'), async (req, res) => {
  try {
    const files = req.files;
    const setNamesAndImages = {};
    console.log(files[0]);
    for(let i = 0; i < files.length; i++) {
      const pathParts = atob(files[i].originalname).split("/");
      let folderName;
      if(pathParts.length === 3) folderName = pathParts[1];
      else folderName = pathParts[0];
      const imgObj = {
        path: "/uploads/"+files[i].filename,
        type: files[i].mimetype
        }
      if(setNamesAndImages.hasOwnProperty(folderName)) {
        setNamesAndImages[folderName].push(imgObj);
      }
      else {
        setNamesAndImages[folderName] = [imgObj];
      }
    }
    for(const setName in setNamesAndImages) {
      const setID = await dbHandler.createNewImageSet(setName);
      await dbHandler.addImagesToImageSet(setID, setNamesAndImages[setName]);
    }
  } catch(error) {
    console.error(error);
    res.status(500).send(error);
  }
  res.status(200).send();
});

router.get('/setPreviews', verifyToken, async (req, res) => {
  try {
    const imageSets = await dbHandler.getAllImageSetIDs();
    const loadedSetIDs = req.header("loadedSetIDs").split(",").map(number => Number(number));
    const answerSets = [];
    for(let i = 0; i < imageSets.length; i++) {
      if(loadedSetIDs.includes(imageSets[i].ID)) {continue;};
      const images = await dbHandler.getImagePathAndTypFromSet(imageSets[i].ID);
      const title = (await dbHandler.getImageSetTitle(imageSets[i].ID)).title;

      imageSets[i].images = [];
      for(let k = 0; k < 3 && k < images.length; k++) {
        imageSets[i].images.push({
          path: images[k].path,
          type: images[k].type
        });
      }
      imageSets[i].title = title;
      answerSets.push(imageSets[i]);
    }
    const answer = {
      sets: answerSets
    }
    res.json(answer);
  } catch(error) {
    console.error(error);
    res.status(500).send();
  }
});

router.get('/sets/:imageSetID', verifyToken, async (req, res) => {
  const imageSetID = req.params.imageSetID;
  const images = await dbHandler.getImageIDAndPathFromSet(imageSetID);
  for(let i = 0; i < images.length; i++) {
    if(await dbHandler.isImageAnnotatedByUser(req.user.ID, images[i].ID)) images[i].annotated = true;
  }
  res.json(images);
});

router.post('/annotations/:imageSetID/:imageID', verifyToken, async (req, res) => {
  const imageSetID = req.params.imageSetID;
  const imageID = req.params.imageID;
  const userID = req.user.ID;
  const rescaledPolygons = req.body;
  const currentDateISO = new Date().toISOString();
  const imageSetAnnotated = await dbHandler.isImageSetAnnotated(userID, imageSetID);
  const imageAnnotated = await dbHandler.isImageAnnotatedByUser(userID, imageID);
  try {
    if(rescaledPolygons.length > 0) {
      if(!imageSetAnnotated) await dbHandler.markImageSetAsAnnotated(userID, imageSetID);
      else {
        await dbHandler.updateAnnotationTimestampForImageSet(imageSetID, userID, currentDateISO);
      }

      if(imageAnnotated) {
        await saveAnnotations(userID, imageID, rescaledPolygons);
        await dbHandler.updateAnnotationTimestampForImage(imageID, userID, currentDateISO);
      } else {
        await addNewAnnotations(userID, imageID, rescaledPolygons);
        await dbHandler.markImageAsAnnotated(userID, imageID);
      }
    } else {
      if(imageSetAnnotated) {
        await dbHandler.removeImageSetAsAnnotated(userID, imageSetID);
      }
      if(imageAnnotated) {
        await dbHandler.removeImageAsAnnotated(userID, imageID);
        await deleteAllAnnotations(userID, imageID);
      }
    }
    
    res.status(200).send();
  } catch(error) {
    console.error(error);
    res.status(500).send(error);
  }
  
});

async function saveAnnotations(userID, imageID, rescaledPolygons) {
  await deleteAllAnnotations(userID, imageID)
  await addNewAnnotations(userID, imageID,rescaledPolygons);
}

async function deleteAllAnnotations(userID, imageID) {
  const annotations = await dbHandler.getAnnotationIDs(userID, imageID);
  await dbHandler.deleteAllAnnotationsForImage(userID, imageID);
  for(let m = 0; m < annotations.length; m++) {
    await dbHandler.deletePoints(annotations[m].ID);
    await dbHandler.deleteAttributes(annotations[m].ID);
  }
}

async function addNewAnnotations(userID, imageID, rescaledPolygons) {
  for(let i = 0; i < rescaledPolygons.length; i++) {
    const annotationID = await dbHandler.addAnnotationToImage(imageID, userID, rescaledPolygons[i]);

    //Add Points
    await dbHandler.addPointsToAnnotation(annotationID, rescaledPolygons[i]._points);

    //Add Attributes
    await dbHandler.addAttributesToAnnotation(annotationID, rescaledPolygons[i]._attributeList);
  }
}

export default router;