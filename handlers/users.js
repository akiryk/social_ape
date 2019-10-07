const { db, admin, } = require('../util/admin');

const config = require('../util/config.js');
const firebase = require('firebase');
const firebaseStorageUrl = 'http://firebasestorage.googleapis.com/v0/b';

const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails,
} = require('../util/validators');

firebase.initializeApp(config);
exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const { isValid, errors, } = validateSignupData(newUser);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const noImg = 'no-img.png';
  let token, userId;

  db.doc(`users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken', });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(tokenId => {
      token = tokenId;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `${firebaseStorageUrl}/${config.storageBucket}/o/${noImg}?alt=media`,
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token, });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use', });
      }
      return res.status(500).json({ error: err.code, });
    });
};

exports.login = (req, res) => {
  console.log('EMAIL');
  console.log(req.body.email);
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { isValid, errors, } = validateLoginData(user);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token, });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        return res
          .status(403)
          .json({ general: 'Wrong credentials, please try again', });
      } else {
        return res.status(500).json({ error: err.code, });
      }
    });
};

exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);
  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      return res.json({
        message: 'successfully updated user details',
        updatedDetails: { ...userDetails, },
      });
    })
    .catch(err => {
      return res.status(500).json({ error: err.code, });
    });
};

exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection('likes')
          .where('userHandle', '==', req.user.handle)
          .get();
      }
    })
    .then(data => {
      userData.likes = ['one like',];
      data.forEach(doc => {
        userData.likes.push(doc.data());
      });
      return res.json(userData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code, });
    });
};

exports.uploadImage = (req, res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: req.headers, });
  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({ error: 'Wrong file type detected', });
    }
    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    imageFileName = `${Math.round(
      Math.random() * 10000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype, };
    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            dType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        // alt-media shows image on browser rather than downloading it
        const imageUrl = `${firebaseStorageUrl}/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`users/${req.user.handle}`).update({ imageUrl, });
      })
      .then(() => {
        return res.json({ message: 'Image uploaded successfully!', });
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.code, });
      });
  });
  busboy.end(req.rawBody);
};
