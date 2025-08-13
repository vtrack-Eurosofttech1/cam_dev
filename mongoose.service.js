const mongoose = require("mongoose");

let isConnected = false;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 50, // 👈 Prevent too many parallel connections
};

const connectWithRetry = async() => {
  if (isConnected) {
    console.log("🟢 Already connected to MongoDB.");
    return mongoose;
  }else{
    console.log("🟢 Not Already connected to MongoDB.");

  }
  const uri =
  process.env.ENVIRONMENT === "DEVELOPMENT" ?
  process.env.DEV_MONGO
  :process.env.PROD_MONGO
  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log(process.env.ENVIRONMENT === "DEVELOPMENT" ?"DevWrapper for devlopemnt MongoDB is connected":"✅ MongoDB connected.");
    console.log("🔗 Open connections count:", mongoose.connections.length);
    return mongoose;
  } catch (error) {
    console.error("❌ MongoDB connection error. Retrying in 5s...");
    setTimeout(connectWithRetry, 5000);
  }
  // mongoose
  //   .connect(uri, options)
  //   .then(() => {
  //     console.log("MongoDB is connected");
  //   })
  //   .catch((err) => {
  //     console.log(
  //       "MongoDB connection unsuccessful, retry after 5 seconds. ",
  //       err
  //     );
  //     setTimeout(connectWithRetry, 5000);
  //   });
};

// Development DevWrapp Database Connection
// const connectWithRetryDev = () => {
//   // const uri = "mongodb://127.0.0.1:27017/VtrackV1_Local?retryWrites=true&w=majority";
//   const uri =
//     "mongodb+srv://DevWrapper:nuLxZCq6XRiKL8p3@vtracksolutions.nih4b.mongodb.net/Dev_VtrackV1?retryWrites=true&w=majority";
//   mongoose
//     .connect(uri, options)
//     .then(() => {
//       console.log("DevWrapper for devlopemnt MongoDB is connected");
//     })
//     .catch((err) => {
//       console.log(
//         "DevWrapper MongoDB connection unsuccessful, retry after 5 seconds. ",
//         err
//       );
//       setTimeout(connectWithRetry, 5000);
//     });
// };

// if (process.env.ENVIRONMENT === "DEVELOPMENT") {
//   connectWithRetryDev();
// } else {
//   connectWithRetry();
// }
process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("🛑 MongoDB disconnected on app termination");
  process.exit(0);
});
connectWithRetry()
exports.mongoose = mongoose;
