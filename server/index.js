//server/index.js
const app = require('./index_app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});