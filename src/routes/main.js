import express from 'express';
import fs from 'fs';
import {verifyToken, isAdmin} from './login.js';
import DBHandler from '../databaseHandler.js';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
      cb(null, './uploads')
  }
});
const upload = multer({storage});

const router = express.Router();
const dbHandler = new DBHandler();

router.get('/', verifyToken, async (req, res, next)  => {
  const user = await getCookieWithIsAdmin(req.cookies);
  res.render('main', user, (err, html) => {
    res.send(html);
  });
});

router.get("/loadAnnotations/:imageID", verifyToken, async (req, res) => {
  const imageID = req.params.imageID;
  const boardState = {};
  if(await dbHandler.isImageAnnotatedByUser(req.cookies.ID, imageID)) {
    boardState.polygonCollection = await dbHandler.getAnnotationsFromImage(req.cookies.ID, imageID);
    for(let i = 0; i < boardState.polygonCollection.length; i++) {
      boardState.polygonCollection[i].attributes = await dbHandler.getAttributesFromAnnotation(boardState.polygonCollection[i].ID);
      boardState.polygonCollection[i].points = await dbHandler.getPointsFromAnnotation(boardState.polygonCollection[i].ID);
    }
  }
  res.json(boardState);
});

router.get('/loadSet/:imageSetID', verifyToken, async (req, res) => {
  const imageSetID = req.params.imageSetID;
  const images = await dbHandler.getImageIDAndPathFromSet(imageSetID);
  for(let i = 0; i < images.length; i++) {
    if(await dbHandler.isImageAnnotatedByUser(req.cookies.ID, images[i].ID)) images[i].annotated = true;
  }
  res.json(images);
});

router.post('/saveAnnotations/:imageSetID/:imageID', verifyToken, async (req, res) => {
  const imageSetID = req.params.imageSetID;
  const imageID = req.params.imageID;
  const rescaledPolygons = req.body;
  try {
    if(rescaledPolygons.length > 0) {
      if(!(await dbHandler.isImageSetAnnotated(req.cookies.ID, imageSetID))) await dbHandler.markImageSetAsAnnotated(req.cookies.ID, imageSetID);

      await saveAnnotations(req.cookies.ID, imageID, rescaledPolygons);
    } else {
      // No Annotations on this image by this user
      await deleteAllAnnotations(req.cookies.ID, imageID);

      if((await dbHandler.isImageSetAnnotated(req.cookies.ID, imageSetID))) {
        await dbHandler.removeImageSetAsAnnotated(req.cookies.ID, imageSetID);
        await dbHandler.removeImageAsAnnotated(req.cookies.ID, imageID);
      }
    }
    
    res.status(200).send();
  } catch(error) {
    console.error(error);
    res.status(500).send(error);
  }
  
});

async function saveAnnotations(userID, imageID, rescaledPolygons) {
  // DELETE ALL
  if(await dbHandler.isImageAnnotatedByUser(userID, imageID)) {
    await deleteAllAnnotations(userID, imageID)
  } else await dbHandler.newAnnotationByUser(userID, imageID);
  // ADD NEW
  await addNewAnnotations(userID, imageID, rescaledPolygons);
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
    const annotationID = await dbHandler.addAnnotationToImage(imageID, rescaledPolygons[i]);

    //Add Points
    for(let k = 0; k < rescaledPolygons[i]._points.length; k++) {
      await dbHandler.addPointToAnnotation(annotationID, rescaledPolygons[i]._points[k]);
    }

    //Add Attributes
    for(let x = 0; x < rescaledPolygons[i]._attributeList.length; x++) {
      await dbHandler.addAttributeToAnnotation(annotationID, rescaledPolygons[i]._attributeList[x]);
    }
  }
}

router.post('/uploadSet', verifyToken, isAdmin, upload.array('images'), async (req, res) => {
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
      console.log(error);
      res.status(500).send(error);
    }
  }
  res.status(200).send();
});

router.get('/loadSetPreviews', verifyToken, async (req, res) => {
  try {
    const imageSets = await dbHandler.getAllImageSets();
    const loadedSetIDs = req.header("loadedSetIDs").split(",").map(number => Number(number));
    const answerSets = [];
    for(let i = 0; i < imageSets.length; i++) {
      if(loadedSetIDs.includes(imageSets[i].ID)) {continue;};
      const images = await dbHandler.getImagePathAndTypFromSet(imageSets[i].ID);
      const title = (await dbHandler.getImageSetTitle(imageSets[i].ID)).title;

      imageSets[i].images = [];
      for(let k = 0; k < 3 && images.length; k++) {
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
    console.log(error);
    res.status(500).send();
  }
});

async function getCookieWithIsAdmin(cookies) {
  const isAdmin = await dbHandler.isAdmin(cookies.ID);
  return {
    email: cookies.email,
    token: cookies.token,
    ID: cookies.ID,
    firstName: cookies.firstName,
    lastName: cookies.lastName,
    isAdmin: isAdmin
  }
}

export default router;