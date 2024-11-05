import { Hono } from "hono";
import { createFactory } from "hono/factory";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const factory = createFactory();

export { factory, Hono, z, zValidator };
