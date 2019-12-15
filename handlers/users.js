const firebase = require('firebase');
const BusBoy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
const config = require('../util/config.js');
const { db, admin } = require('../util/admin');

const firebaseStorageUrl = 'http://firebasestorage.googleapis.com/v0/b';

const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails,
} = require('../util/validators');

firebase.initializeApp(config);

/**
 * Sign up -- create a new user and login
 *
 */
exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const { isValid, errors } = validateSignupData(newUser);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const noImg = 'no-img.png';
  let token;
  let userId;

  db.doc(`users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken' });
      }
      return firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password);
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
        imageUrl: `${firebaseStorageUrl}/${
          config.storageBucket
        }/o/${noImg}?alt=media`,
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => res.status(201).json({ token }))
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use' });
      }
      return res.status(500).json({ error: err.code });
    });
};

exports.login = (req, res) => {
  console.log('EMAIL');
  console.log(req.body.email);
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { isValid, errors } = validateLoginData(user);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => data.user.getIdToken())
    .then(token => res.json({ token }))
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        return res
          .status(403)
          .json({ general: 'Wrong credentials, please try again' });
      }
      return res.status(500).json({ error: err.code });
    });
};

exports.addUserDetails = (req, res) => {
  const userDetails = reduceUserDetails(req.body);
  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() =>
      res.json({
        message: 'successfully updated user details',
        updatedDetails: { ...userDetails },
      })
    )
    .catch(err => res.status(500).json({ error: err.code }));
};

exports.getAuthenticatedUser = (req, res) => {
  const userData = {};
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
      userData.likes = [];
      data.forEach(doc => {
        userData.likes.push(doc.data());
      });
      // return res.json(userData);
      return db
        .collection('notifications')
        .where('recipient', '==', req.user.handle)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
    })
    .then(data => {
      userData.notifications = [];
      data.forEach(doc => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          createdAt: doc.data().createdAt,
          screamId: doc.data().screamId,
          type: doc.data().type,
          read: doc.data().read,
          notificationId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.uploadImage = (req, res) => {
  const busboy = new BusBoy({ headers: req.headers });
  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({ error: 'Wrong file type detected' });
    }
    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    imageFileName = `${Math.round(
      Math.random() * 10000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
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
        const imageUrl = `${firebaseStorageUrl}/${
          config.storageBucket
        }/o/${imageFileName}?alt=media`;
        return db.doc(`users/${req.user.handle}`).update({ imageUrl });
      })
      .then(() => res.json({ message: 'Image uploaded successfully!' }))
      .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });
  busboy.end(req.rawBody);
};
