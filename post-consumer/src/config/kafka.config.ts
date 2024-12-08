import { Admin, logLevel, Kafka, Producer, Consumer } from "kafkajs";

class KafkaConfig {
  private kafka: Kafka;
  private consumer: Consumer;

  private broker: string;
  constructor() {
    this.broker = process.env.KAFKA_BROKERS || "192.168.116.221:9092";
    this.kafka = new Kafka({
      clientId: "post-producer",
      brokers: [this.broker],
      logLevel: logLevel.ERROR,
    });
    this.consumer = this.kafka.consumer({
      groupId: "post-consumer",
    });
  }

  async subScriptTopic(topic: string): Promise<void> {
    try {
      await this.consumer.subscribe({
        topic,
        fromBeginning: true,
      });
      console.log("subscribed to topic", topic);
    } catch (err) {
      console.log(err);
    }
  }

  async consume(callback: (message: any) => void): Promise<void> {
    try {
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log("Message Recieved", {
            topic,
            partition,
            value: message?.value?.toString(),
          });
          callback(JSON.parse(message?.value?.toString()!));
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
  async connect(): Promise<void> {
    try {
      await this.consumer.connect();
      console.log("Connected to Kafka");
    } catch (err) {
      console.log(err);
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.consumer.disconnect();

      console.log("Kafka disconnected");
    } catch (err) {
      console.log(err);
    }
  }
}

export default new KafkaConfig();
