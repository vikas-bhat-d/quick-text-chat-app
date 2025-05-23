import { configDotenv } from "dotenv";
import server from "./src/app.js";
import connectDB from "./db/dbConnection.js";

configDotenv({
  path: "./.env",
});

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 5000, () =>
      console.log("Listening on port ", process.env.PORT || 5000)
    );
  })
  .catch((err) => {
    console.log("error occured");
  });
