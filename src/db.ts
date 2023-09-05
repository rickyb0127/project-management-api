require('dotenv').config();
const mongoose = require('mongoose');

const initDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)

    console.log(`mongodb connected: ${conn.connection.host}`)
  } catch(err) {
    console.log(err);
    process.exit(1);
  }
}

module.exports = initDb;