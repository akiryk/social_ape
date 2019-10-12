const { db } = require('../util/admin');

exports.getAllScreams = (req, res) => {
  db.collection('screams')
    .orderBy('createdAt', 'desc')
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
};

exports.postOneScream = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ body: 'Body must not be empty' });
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };

  db.collection('screams')
    .add(newScream)
    .then(doc => {
      return res.json({ screamId: doc.id, ...newScream });
    })
    .catch(err => {
      res.status(500).json({ error: 'something went wrong saving the scream' });
      console.error(err);
    });
};

exports.getScream = (req, res) => {
  let screamData = {};
  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      screamData = doc.data();
      screamData.screamId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('screamId', '==', req.params.screamId)
        .get();
    })
    .then(data => {
      screamData.comments = [];
      data.forEach(doc => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.commentOnScream = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ error: 'must not be empty' });
  }

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'scream not found' });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      console.log('newComment');
      console.log(newComment);
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      return res.json(newComment);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: 'Something went wrong adding a new comment'
      });
    });
};

exports.likeScream = (req, res) => {
  // check if the like already exists
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('screamId', '==', req.params.screamId)
    .limit(1);
  // check if the scream already exists
  const screamDocument = db.doc(`/screams/${req.params.screamId}`);
  let screamData;

  screamDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        screamData = doc.data();
        screamData.screamId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: 'Scream not found' });
      }
    })
    .then(data => {
      if (!data.empty) {
        return res.status(400).json({ error: 'Scream already liked' });
      }
      return db.collection('likes').add({
        screamId: req.params.screamId,
        userHandle: req.user.handle
      });
    })
    .then(() => {
      screamData.likeCount++;
      return screamDocument.update({ likeCount: screamData.likeCount });
    })
    .then(() => {
      return res.json(screamData);
    })
    .catch(err => {
      return res.status(500).json({ error: err.code });
    });
};

exports.unlikeScream = (req, res) => {
  // check if the like already exists
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('screamId', '==', req.params.screamId)
    .limit(1);

  // check if the scream already exists
  const screamDocument = db.doc(`/screams/${req.params.screamId}`);

  let screamData;

  screamDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        screamData = doc.data();
        screamData.screamId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: 'Scream not found' });
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: 'Scream not liked' });
      }
      return db.doc(`/likes/${data.docs[0].id}`).delete();
    })
    .then(() => {
      screamData.likeCount--;
      return screamDocument.update({ likeCount: screamData.likeCount });
    })
    .then(() => {
      return res.json(screamData);
    })
    .catch(err => {
      return res.status(500).json({ error: err.code });
    });
};

exports.deleteScream = (req, res) => {
  const screamDocument = db.doc(`/screams/${req.params.screamId}`);
  screamDocument
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: 'Not authorized to delete' });
      }
      console.log('TRY TO DELETE');
      return screamDocument.delete();
    })
    .then(() => {
      res.json({ message: 'Scream deleted successfully' });
    })
    .catch(err => {
      res.status(500).json({ error: err.code });
    });
};
