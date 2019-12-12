# Social App Firebase Tutorial

A tutorial about using firebase and react to create a social app. See [videos from CodeCamp](https://www.youtube.com/watch?v=-vo7cu0xP4I&list=PLMhAeHCz8S38ryyeMiBPPUnFAiWnoPvWP&index=2).

## Setup

```sh
cd Documents/projects/socialape-functions/functions
nvm use 8.13.0
npm install -g firebase-tools
firebase serve
```

_Note that if you use a different version of Node, you may need to reinstall firebase tools_

## Current Status

- Add comment works (use POST)
  `path/to/api/scream/SOMESCREAMID/comment`

```json
{
  "body": "Some comment body"
}
```

- Add like works (use GET)
  `path/to/api/scream/SOMESCREAMID/like`
  No need for body

- Unlike comment works (use GET)
  `path/to/api/scream/SOMESCREAMID/like`

- Delete scream works (use DELETE)
  `path/to/api/scream/SOMESCREAMID/`
  No need for word `delete` and no need for body

Watched through video 11, in which we check credentials before allowing user to submit a scream.
Up Next [video 12](https://www.youtube.com/watch?v=uu43m1SpbTA&list=PLMhAeHCz8S38ryyeMiBPPUnFAiWnoPvWP&index=12)
