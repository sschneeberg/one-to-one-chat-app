# MERN Stack 1:1 Chat Application

This application is built using React, Material-UI, React-Router, Node, & Express.js.

Fork and clone this repository to your local machine to test and run the app. This app is not currently deployed.
The project is broken down into a client and server folder, containing a React app and an Express app respectively.
At this point in time, the client is a basic react app that remains to be built out.

# Server

## Installation

1. In terminal, `cd` into the server directory and run `npm install` to grab the required dependencies
2. Create your `.env` file with the following variables:
    - JWT_SECRET
    - JWT_EXP
    - MONGO_URI
    - SECURE (set to false for development)
    - PORT (optional: will run on 3001 if not set in the .env)
3. Seed your database with to confirm connection and set up test data. From inside server run `node seeders/userSeed.js` or from the root directory run `node server/seeders/userSeed.js`

## Testing

Test the server endpoints by running `mocha` inside the server directory. There are two test files with a total of 24 tests dividede between the authentication routes and the chat routes. To just test authentication run `mocha test/auth.test.js`; to just test chat functionality run `mocha test/chat.test.js`.

**_Please note:_ These tests will wipe and seed the connected database when executed. Make sure you are connected to a test database before running.**

## Routes

| Method | Endpoint        | Request Expected          | Success Response Data | Access  | Purpose                                           |
| ------ | --------------- | ------------------------- | --------------------- | ------- | ------------------------------------------------- |
| GET    | /welcome        | -                         | Message               | Public  |                                                   |
| GET    | /users          | Search Term               | Users Array           | Private | Query users with username matching a given string |
| POST   | /users/register | Password, Email, Username | Message               | Public  | Signup and login a user                           |
| POST   | /users/login    | Password, Email           | Message               | Public  | Login in a user                                   |
| GET    | /chats          | User id                   | Chats                 | Private | Query all conversations for the logged in user    |
| GET    | /chats/:id      | -                         | Messages              | Private | Query all messages for a given chat               |
| POST   | /chats          | Members                   | Message               | Private | Add a chat for the logged in user                 |
| POST   | /chats/:id      | Content                   | Message               | Private | Add a message to a given chat                     |

## Models

The app contains three simple models: Users, Messages, and Chats.

### Users

The User model requires a username, password, and unique email. Before saving, the password is hashed and a search tag is created to help with fuzzy/partial searching. An index is created on `searchTag` to allow for `$text` queries.

```js
const userSchema = new Schema(
    {
        username: { type: String, required: true, minLength: 3 },
        searchTag: { type: String, maxLength: 3 },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true }
    },
    { autoIndex: false }
);
```

### Messages

With the Message model, a document can be created for each message sent to allow the capture of message history for as far back as desired. The `chat_id` is stored to know who the message was to, while `user_from` holds the sender's user id.

```js
const messageSchema = new Schema({
    content: { type: String, required: true },
    chat_id: { type: String, required: true, unique: true },
    user_from: { type: String, required: true },
    sent_at: { type: Date, required: true, default: new Date() }
});
```

### Chats

The Chat model collects the users belonging to each chat. While the intention of this app is a 1:1 messaging system, this could allow for future integration of group messaging. An index is created on the user id to make it more efficient to search the chats for the ones a user belongs to.

```js
const memberSchema = new Schema(
    {
        id: { type: String, index: true },
        username: { type: String }
    },
    { autoIndex: false, _id: false }
);

const chatSchema = new Schema({
    members: [memberSchema]
});
```
