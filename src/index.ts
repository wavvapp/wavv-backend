import app from "./app";
import DataSource from "./data-source";

const port = process.env.PORT || 3000;

DataSource.initialize()
  .then(async () => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
