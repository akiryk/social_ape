# Social App Firebase Tutorial

A tutorial about using firebase and react to create a social app. See [videos from CodeCamp](https://www.youtube.com/watch?v=-vo7cu0xP4I&list=PLMhAeHCz8S38ryyeMiBPPUnFAiWnoPvWP&index=2).

## Setup

```sh
cd Documents/projects/socialape-functions/functions
nvm use 8.13.0
npm install -g firebase-tools
firebase serve
```
It also works with v11.6.
_Note that if you use a different version of Node, you may need to reinstall firebase tools_

## Test the REST API with Postman

### Get the test url
- After running `firebase serve`, you will get a message in the console like `http function initialized (http://localhost:5000/simplereactapp-bed9b/us-east1/api)`.
- Use the url it provides, e.g. http://localhost:5000/simplereactapp-bed9b/us-east1/api

### Log in
- Open Postman and use POST
- Enter credentials using BODY and raw/JSON
```json
{
  "email": "name@test.com",
  "password": "password"
}
```

### To do anything that requires login
- Start by logging in, above.
- This should return a token. Copy it to clipboard
- Open the Authorization tab and select Type: Bearer Token.
- Paste the copied token into the token input. It should not display as a temporary header in the Headers tab.

### Get all screams
- Login and add credentials to header, as above.
- Open Postman and use GET
- paste in the path to screams endpoint: `path/to/api/screams`

### Post a new scream
- Login and add credentials to header, as above.
- Open Postman and use POST
- paste in the path to screa endpoint: `path/to/api/scream`
- Add a new scream using BODY and raw/JSON:
```json
{
  "body": "My new scream"
}
```

### Add a comment to a scream works
- Login and add credentials to header, as above.
- Open Postman and use POST
- paste in the path to scream/comment endpoint: `path/to/api/scream/SOMESCREAMID/comment`
-

```json
{
  "body": "My comment on this scream"
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
