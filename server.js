require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
require("./config/db");
const PORT = process.env.PORT_BACKEND || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

connectDB();
