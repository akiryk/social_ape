/**
 * DB Schema outline
 *
 * Not used by anything, but helpful as a guide
 */

export const db = {
  screams: [
    {
      userHandle: 'user',
      body: 'The scream',
      createdAt: '2019-08-16T17:23:14.512Z',
      likeCount: 5,
      commentCount: 10, // better to store here than reading comments.length every time, since Firebase charges per read
    },
  ],
};
