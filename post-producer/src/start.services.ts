import kafkaConfig from "./config/kafka.config";
export const init = async () => {
  try {
    await kafkaConfig.connect();
    await kafkaConfig.createTopic("post");
  } catch (err) {
    console.log(err);
    process.exit(1)
  }
};
