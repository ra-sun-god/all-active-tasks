import "dotenv/config";

export interface ServerConfig {
  host:   string;
  port:   number;
  sslKey?:  string | null;
  sslCert?: string | null;
  sessionSecret: string;
}

export const serverConfig: ServerConfig = {
  host: process.env.TASK_1_SERVER_HOST ?? "127.0.0.1",
  port: Number(process.env.TASK_1_SERVER_PORT ?? 3030),
  sslKey: process.env.SERVER_SSL_KEY,
  sslCert: process.env.SERVER_SSL_CERT,
  sessionSecret: process.env.SERVER_SESSION_SECRET ?? "01e0bbd2ca35aef38af6430749c85c4484a4d08f8813fe5c3d48b8801e399dd7",
}
