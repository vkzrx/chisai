import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { HTTPException } from "hono/http-exception";
import { prettyJSON } from "hono/pretty-json";
import { nanoid } from "nanoid";
import { z } from "zod";

type Bindings = {
  DB: D1Database;
};

const api = new Hono<{ Bindings: Bindings }>().basePath("/api");

api.use("*", prettyJSON());

api.get("/_health", (c) => c.text("healthy"));

type UrlRecord = {
  id: number;
  original: string;
  shorten: string;
  clicks: number;
  created_at: string;
};

api.get("/:shorten", async (c) => {
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

const shortenRoute = api.post(
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
      "INSERT INTO urls (original, shorten) VALUES (?, ?) RETURNING *",
    )
      .bind(body.url, shorten)
      .run<UrlRecord>();

    if (!query.success) {
      throw new HTTPException(500, { message: "Internal Server Error" });
    }

    return c.jsonT(query.results[0], 201);
  },
);

export type AppType = typeof shortenRoute;

export const onRequest = handle(api);
