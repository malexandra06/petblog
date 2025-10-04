import express from "express";
import bodyParser from "body-parser";
import userRouter from "./routes/userRoute.js";
import postRouter from "./routes/postRoute.js";

import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectMySQL from "express-mysql-session";
import { requireAuth } from "./middlewares.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");

const MySQLStore = connectMySQL(session);

app.use(cookieParser());
app.set("views", path.join(__dirname, "../../frontend/views"));
app.use(express.static(path.join(__dirname, "../../frontend/public")));
console.log("Serving static files from:", path.join(__dirname, "../../frontend/public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Session Config ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // secure cookie doar pe HTTPS
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
    },
    store: new MySQLStore({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      database: process.env.DB_NAME || "blog_users",
    }),
  })
);

// --- Middleware pentru sesiuni expirate ---
app.use((req, res, next) => {
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    return next();
  }

  if (req.session && req.session.user) {
    const now = Date.now();
    const lastActivity = req.session.lastActivity;
    const timeoutDuration = 5 * 60 * 1000;

    if (lastActivity) {
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity > timeoutDuration) {
        res.clearCookie("connect.sid");
        return res.redirect("/login?expired=true");
      }
    }

    if (req.method === "GET" || req.method === "POST") {
      req.session.lastActivity = now;
    }
  }

  next();
});

// --- Variabile globale in views ---
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isLoggedIn = !!req.session.user;
  next();
});

// --- Routes ---
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

app.get("/", (req, res) => res.render("index"));

app.get("/login", (req, res) => {
  let error = null;
  if (req.query.expired) {
    error = "Your session has expired. Please log in again.";
  }
  res.render("login", { error });
});

app.get("/register", (req, res) => res.render("register"));
app.get("/create-post", (req, res) => res.render("createPost"));

app.get("/my-posts", requireAuth, (req, res) => {
  res.render("myPosts", { username: req.session.user.username });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "logout error" });
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

app.get("/:username", (req, res) => {
  res.render("userPosts", { username: req.params.username });
});

// --- Start server ---
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
