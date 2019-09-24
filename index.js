const functions = require("firebase-functions");
// get access to the database
const admin = require("firebase-admin");

// initialize our app.
admin.initializeApp();

const express = require("express");
const app = express();

const db = admin.firestore();

const firebaseConfig = {
  apiKey: "AIzaSyBSqXMcx-gHDs-JsvcmBC5HACfPzU1hbcM",
  authDomain: "simplereactapp-bed9b.firebaseapp.com",
  databaseURL: "https://simplereactapp-bed9b.firebaseio.com",
  projectId: "simplereactapp-bed9b",
  storageBucket: "simplereactapp-bed9b.appspot.com",
  messagingSenderId: "393695939050",
  appId: "1:393695939050:web:7113e754e9825c2d"
};

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .limit(5)
    .get()
    .then(data => {
      const screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle || doc.data().userName,
          likeCount: doc.data().likeCount || 0,
          commentCount: doc.data().commentCount || 0,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
});

// Authentication Middleware
const FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      console.log(decodedToken);
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      console.error("Error while verifying token", err);
      return res.status(403).json(err);
    });
};

// Post one scream
app.post("/scream", FBAuth, (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "Body must not be empty" });
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString()
  };

  db.collection("screams")
    .add(newScream)
    .then(doc => {
      return res.json({ message: `document ${doc.id} created successfully!` });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong saving the scream" });
      console.error(err);
    });
});

// helper function for validation
const isEmpty = (string = "") => string.trim() === "";

const isEmail = email => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(emailRegEx) ? true : false;
};

const isNewUserValid = ({ email, password, confirmPassword, handle }) => {
  let errors = {};
  if (isEmpty(email)) {
    errors.email = "must not be empty";
  } else if (!isEmail(email)) {
    errors.email = "must be a valid address";
  }

  if (isEmpty(password)) {
    errors.password = "must not be empty";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "passwords must match";
  }

  if (isEmpty(handle)) {
    errors.handle = "must not be empty";
  }

  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors };
};

app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  const { isValid, errors } = isNewUserValid(newUser);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  let token, userId;

  db.doc(`users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
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
        userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      }
      return res.status(500).json({ error: err.code });
    });
});

app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  let errors = {};
  if (isEmpty(user.email)) {
    errors.email = "must not be empty";
  }

  if (isEmpty(user.password)) {
    errors.password = "must not be empty";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Wrong credentials, please try again" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.region("us-east1").https.onRequest(app);
