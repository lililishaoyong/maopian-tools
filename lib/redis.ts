import { createClient, type RedisClientType } from "redis";
import { redisUrl } from "./env";

let client: RedisClientType | null = null;

export async function getRedis() {
  if (!client) {
    client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 500,
        reconnectStrategy: false
      }
    });
    client.on("error", (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error("[redis]", error);
      }
    });
  }

  if (!client.isOpen) {
    try {
      await client.connect();
    } catch (error) {
      client.removeAllListeners();
      client = null;
      throw error;
    }
  }

  return client;
}
