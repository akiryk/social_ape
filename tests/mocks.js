const screams = [
  {
    screamId: 'nuyrIJLAkh2TOdN47l9w',
    data: () => ({
      body: "Sometimes, you write things here, and I don't agree",
      userHandle: 'JohnJohn',
      likeCount: 2,
      commentCount: 3,
      createdAt: '2019-12-15T14:20:09.822Z',
    }),
  },
  {
    screamId: '9770ZONzTyau9e7zrKQx',
    data: () => ({
      body: 'Check it out, a live thing',
      userHandle: 'akiryk',
      likeCount: 2,
      commentCount: 2,
      createdAt: '2019-12-14T13:10:01.300Z',
    }),
  },
];

const mockScreams = {
  collection: () => mockScreams,
  orderBy: () => mockScreams,
  limit: () => mockScreams,
  get: () => Promise.resolve(screams),
};

module.exports = {
  mockScreams,
};
