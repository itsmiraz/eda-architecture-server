import { connectDB } from "./config/db.config";
import kafkaConfig from "./config/kafka.config";
import { PostConsumer } from "./services/post.consumer";

export const init = async () => {
  try {
    await connectDB();
    await kafkaConfig.connect();
    await PostConsumer()
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
