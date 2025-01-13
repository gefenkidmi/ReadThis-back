import initApp from "./server";

initApp()
  .then((app) => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize app:", error);
    process.exit(1);
  });