const express = require("express");
// Morgan: is another HTTP request logger middleware for Node. js. 
// It simplifies the process of logging requests to your application. 
// You might think of Morgan as a helper that collects logs from your server, such as your request logs. 
// It saves developers time because they don't have to manually create common logs.
const logger = require("morgan");
const mongoose = require("mongoose");
// Compression in Node.js and Express decreases the downloadable amount of data that’s served to users. 
const compression = require("compression");

const PORT = process.env.PORT || 4400;

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
    useNewUrlParser: true,
    useFindAndModify: false
});

// API routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
    console.log(`App running on port ${PORT} at http://localhost:${PORT}`);
});


