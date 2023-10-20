import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
import { HTTPException } from "hono/http-exception";
import { jsxRenderer } from "hono/jsx-renderer";
import { prettyJSON } from "hono/pretty-json";
import { nanoid } from "nanoid";
import { z } from "zod";
import { HomePage } from "./pages/home";

declare module "hono" {
  interface ContextRenderer {
    (content: string, props: { title: string }): Response;
  }
}

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", prettyJSON());

app.get("/_health", (c) => c.text("healthy"));

app.get("/:shorten", async (c) => {
  const shorten = c.req.param("shorten");
  if (!shorten) {
    throw new HTTPException(400, { message: "Bad Request" });
  }

  const result = await c.env.DB.prepare(
    "UPDATE urls SET clicks = clicks + 1 WHERE shorten = ? RETURNING original",
  )
    .bind(shorten)
    .first<{ original: string }>();

  if (!result) {
    throw new HTTPException(404, { message: "Not Found" });
  }

  return c.redirect(result.original, 301);
});

app.post(
  "/shorten",
  zValidator(
    "json",
    z.object({
      url: z.string().url(),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json");
    const shorten = nanoid(10);

    const query = await c.env.DB.prepare(
      "INSERT INTO urls (original, shorten) VALUES (?, ?)",
    )
      .bind(body.url, shorten)
      .run();

    if (!query.success) {
      throw new HTTPException(500, { message: "Internal Server Error" });
    }

    return c.json(query.results[0]);
  },
);

app.use("/styles/app.css", serveStatic({ path: "./styles/app.css" }));

app.get(
  "*",
  jsxRenderer((props) => {
    return (
      <html>
        <head>
          <title>{props.title}</title>
          <meta charset="UTF-8" />
          <meta name="description" content="Shorty: URL shortener" />
          <link href="/styles/app.css" rel="stylesheet" />
        </head>
        <body>{props.children}</body>
      </html>
    );
  }),
);

app.get("/", (c) => {
  return c.render(<HomePage name="World" />, { title: "Shorty | Home" });
});

export default app;
