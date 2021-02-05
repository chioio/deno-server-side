import {
  Application,
  Context,
  Router,
} from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.1/mod.ts";
import {
  create,
  getNumericDate,
  verify,
} from "https://deno.land/x/djwt@v2.2/mod.ts";
import type { Header, Payload } from "https://deno.land/x/djwt@v2.2/mod.ts";

// set environment
const env = Deno.env.toObject();
const PORT = env.PORT || "4000";
const HOST = env.HOST || "0.0.0.0";

// create application instance
const app = new Application();
// create router instance
const router = new Router();

// jwt init
const key = "deno-jwt";
const header: Header = {
  alg: "HS256",
  typ: "JWT",
};
const payload: Payload = {
  iss: "JWT Provider",
  exp: getNumericDate(30),
};

// set routes
router
  .get("/", (ctx: Context) => {
    ctx.response.body = "JWT Example";
  })
  .get("/generate", async (ctx: Context) => {
    ctx.response.body = await create(header, payload, key) + "\n";
  })
  .post("/validate", async (ctx: Context) => {
    const headers: Headers = ctx.request.headers;
    const auth = headers.get("Authorization");
    if (!auth) {
      ctx.response.status = 401;
      return;
    }
    const jwt = auth.split(" ")[1];
    if (!jwt) {
      ctx.response.status = 401;
      return;
    }
    console.log(jwt);

    await verify(jwt, key, "HS256")
      .then(() => {
        ctx.response.body = {
          result: "Validate Auth!",
        };
      })
      .catch((err) => {
        ctx.response.body = {
          result: "Invalidate Auth!",
        };
      });
  });

// init app
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

// port listening
console.log(`--------------------`);
console.log(`CORS-enabled web server listening on port: ${PORT}...`);

await app.listen(`${HOST}:${PORT}`);
