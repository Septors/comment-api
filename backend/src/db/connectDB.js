import prisma from "../config/prisma.js";

const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log("prisma connect successfully");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDb;
