import express, { Application } from "express";
import routes from "../src/routes/wishRoutes";
import { initDb } from "./db";
import { logActiveWorkers } from "./middleware/activeWorkersLogger";

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logActiveWorkers);

app.use(routes);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize the database", err);
  });

export default app;
