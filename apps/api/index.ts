import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hasty Tasty API Running");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
