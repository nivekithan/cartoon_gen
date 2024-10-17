import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import Replicate from "replicate";
import { FileOutput } from "replicate";
import { cors } from "hono/cors";
import { getDb } from "./db/getDb";
import { imageTable } from "./db/schema";

const GenerateSchema = z.object({
	prompt: z.string().trim().min(1),
});

export const app = new Hono<{ Bindings: Env }>()
	.use("*", cors())
	.post("/generate", zValidator("json", GenerateSchema), async (c) => {
		const { prompt } = c.req.valid("json");

		const provider = createOpenAI({ apiKey: c.env.OPENAI_API_KEY, compatibility: "strict" });

		const model = provider("gpt-4o");

		const output = await generateObject({
			model,
			schema: z.object({ imagePrompt: z.string().describe("The image prompt used to describe the cartoon") }),
			temperature: 1,
			messages: [
				{
					role: "system",
					content:
						"You write image prompts for political cartoons. Cartoon must be simple which you find in the newspaper with text bubble, it should humours and controversial. There should be joke",
				},
				{ role: "user", content: `Generate image prompt for the following text: ${prompt}` },
			],
		});

		const imagePrompt = output.object.imagePrompt;

		const replicate = new Replicate({ auth: c.env.REPLICATE_API_TOKEN });

		const imageOutput = (await replicate.run("black-forest-labs/flux-1.1-pro", {
			input: {
				prompt: `simple black and white cartoon drawing of ${imagePrompt}, black and white polical cartoon`,
				prompt_upsampling: true,
				width: 1024,
				height: 1024,
				output_quality: 100,
				output_format: "webp",
			},
			wait: { mode: "block" },
		})) as FileOutput;

		const imagePredictionUrl = imageOutput.url().toString();

		console.log({ imagePredictionUrl });

		const response = await fetch(imagePredictionUrl);

		const key = `${crypto.randomUUID()}.webp`;

		console.log(`uploading the file to key`, { key });

		await c.env.CartoonBucket.put(key, response.body, {
			httpMetadata: { contentType: "image/webp", contentDisposition: "inline" },
		});

		console.log(`Uploaded the file`, { key });

		const url = new URL(key, c.env.CARTOON_IMAGE_BUCKET);

		console.log({ url: url.toString() });

		const db = getDb(c.env.DB);

		console.log(`Saving the key to the database`, { key });

		await db.insert(imageTable).values({ key });

		console.log(`Saved the key to the database`, { key });

		return c.json({ data: url, debug: { imagePrompt } });
	});

export default {
	fetch: app.fetch,
} satisfies ExportedHandler<Env>;
