var express = require("express");
var cors = require("cors");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { errorLogger, errorResponder, invalidPathHandler } = require("./middlewares");
const { getUser } = require("./constants");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server");
});

app.get("/stream", (req, res) => {
  res.send("Server");
});

app.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  const database = fs.readFile(__dirname + "/db.json", "utf-8", async (err, data) => {
    try {
      const dataJSON = JSON.parse(data);
      const { users: USERS } = dataJSON;
      const user = USERS.find((USER) => USER.username === username);

      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const uniqueId = uuidv4();

        const newUser = {
          id: uniqueId,
          username,
          password: hashedPassword,
        };

        dataJSON.users.push(newUser);
        fs.writeFile(__dirname + "/db.json", JSON.stringify(dataJSON), () => {
          if (err) {
            console.error(err);
            res.status(500).send("cannot create new account");
          }

          const token = jwt.sign({ user_id: uniqueId, username }, process.env.TOKEN_KEY, {
            expiresIn: "2h",
          });

          res.status(201).send({
            id: uniqueId,
            username,
            role: user.role || "user",
            token,
          });
        });
      } else {
        console.log("already found user login pls", user);
        res.status(400).send("account already created. Please login");
      }
    } catch (err) {
      next(err);
    }
  });
});

app.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  // search for

  if (!username || !password) {
    return res.status(400).send("Need credentials");
  }
  try {
    const database = fs.readFile(__dirname + "/db.json", "utf-8", async (err, data) => {
      const dataJSON = JSON.parse(data);
      const { users: USERS } = dataJSON;
      const user = USERS.find((USER) => USER.username === username);
      const passwordMatched = await bcrypt.compare(password, user.password);

      if (user && passwordMatched) {
        console.log("usernmae, password", username, password, user, passwordMatched);
        console.log("matching");
        const token = jwt.sign({ user_id: user.id, username: user.username }, process.env.TOKEN_KEY, {
          expiresIn: "2h",
        });

        return res.status(200).send({
          id: user.id,
          username,
          role: user.role || "user",
          token,
        });
      } else {
        console.log("not matching");
        return res.status(400).send("login faiuled");
      }
    });
  } catch (err) {
    next(err);
  }
});

app.get("/smth", auth, (req, res, next) => {
  const { user_id } = req.user;
  getUser(user_id)
    .then((data) => {
      console.log("data is ", data);
      return res.send("resources");
    })
    .catch((err) => next(err));
});

function auth(req, res, next) {
  const token = req.token || req.query.token || req.headers["x-access-token"] || req.headers["authorization"];

  console.log("in auth middleware", token);
  if (!token) {
    return res.status(403).send("Token is required to continue");
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
}

// middleware
app.use(errorLogger);
app.use(errorResponder);
app.use(invalidPathHandler);

//app.get("/error", (req, res, next) => {
//  console.log("in 404 error");
//  res.status(404).send("page not found");
//});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Listening on port ", PORT);
});
