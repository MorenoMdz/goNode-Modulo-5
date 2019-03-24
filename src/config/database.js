require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

module.exports = {
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT || 'postgres',
  operatorAliases: false,
  logging: false, // to display logs or not when testing
  define: {
    timestamos: true,
    underscored: true,
    underscoredALL: true,
  },
  // sqlite config
  storage: './__tests__/database',
};
