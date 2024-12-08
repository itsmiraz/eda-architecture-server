import kafkaConfig from "../config/kafka.config";
import { Post } from "../model/posts";

export const PostConsumer = async () => {
  const messages: any[] = [];

  let processing = false;

  try {
    await kafkaConfig.subScriptTopic("post");
    await kafkaConfig.consume(async (message) => {
      messages.push(message);
      console.log("messages received", message);
      if (messages.length > 100) {
        //save into the db
        processMessages();
      }
    });
    setInterval( processMessages, 50000); // run every 5 seconds
  } catch (err) {
    console.log(err);
  }
  async function processMessages() {
    if (messages.length >0 && !processing) {
      processing = true;
      const batchToProcess = [...messages];
      messages.length = 0;
      try {
        await Post.insertMany(batchToProcess, { ordered: false });
        console.log("Bulk insert done");
      } catch (err) {
        console.log(err);
        messages.push(...batchToProcess);
      } finally {
        processing = false;
      }
    }
  }
};
