import { Admin, logLevel, Kafka, Producer } from "kafkajs";

class KafkaConfig {
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;
  private broker: string;
  constructor() {
    this.broker = process.env.KAFKA_BROKERS || "192.168.43.221:9092";
    this.kafka = new Kafka({
      clientId: "post-producer",
      brokers: [this.broker],
      logLevel: logLevel.ERROR,
    });
    this.producer = this.kafka.producer();
    this.admin = this.kafka.admin();
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      await this.admin.connect();
      console.log("Connected to Kafka");
    } catch (err) {
      console.log(err);
    }
  }

  async createTopic(topic: string): Promise<void> {
    try {
      await this.admin.createTopics({
        topics: [
          {
            topic,
            numPartitions: 1,
          },
        ],
      });
      console.log(`Topic "${topic}" created`);
    } catch (err) {
      console.log(err);
    }
  }

  async sendTopic(topic: string, message: string): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: message,
          },
        ],
      });
      console.log("Message sent successfully");
    } catch (err) {
      console.log(err);
    }
  }
  async disconnect(): Promise<void> {
    try {
      this.admin.disconnect();
      this.producer.disconnect();

      console.log("Kafka disconnected");
    } catch (err) {
      console.log(err);
    }
  }
}


export default new KafkaConfig()