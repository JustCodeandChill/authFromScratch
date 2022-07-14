const bcrypt = require("bcrypt");
var fs = require("fs");
const path = require("path");
const USERS = [
  {
    id: 1,
    username: "admin",
    password: "admin",
    role: "admin",
  },
  { id: 2, username: "user", password: "user", role: "user" },
];

const validation = (usernameProvided, passwordProvided) => {
  console.log(usernameProvided, passwordProvided);
  const result = USERS.find(({ username, password, role }) => {
    return username === usernameProvided && password === passwordProvided;
  });

  return new Promise((res, rej) => {
    if (result) {
      res(result);
    } else {
      rej(new Error("cannot find user with credentials"));
    }
  });
};

const getUser = (userId) => {
  return new Promise((res, rej) => {
    fs.readFile(path.resolve(__dirname, "../db.json"), "utf-8", (err, data) => {
      console.log("user id", userId);
      const USERS = JSON.parse(data).users;

      const user = USERS.find((USER) => USER.id === userId);

      if (user) {
        res(user);
      } else {
        rej(new Error("user not found"));
      }
    });
  });
};

module.exports = { USERS, validation, getUser };
