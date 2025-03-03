const redis = require("redis");
const bluebird = require("bluebird");
bluebird.promisifyAll(redis);

module.exports = async function redisConnectionHelper() {
  const REDIS_URL = "redis://127.0.0.1:6379"; // Your Redis server URL

  const redisClient = redis.createClient({
    url: REDIS_URL,
    connect_timeout: 10000
  });

  redisClient.on("error", (error) => {
    console.log("Error on Redis: ", error.message);
  });

  redisClient.on("ready", () => {
    console.log("Redis has been connected!");
  });

  // Connect to Redis asynchronously
  await redisClient.connect();
  return redisClient;
};
