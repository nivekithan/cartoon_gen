import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: 'migrations',
	schema: './src/db/schema.ts',
	dialect: 'sqlite',
	casing: 'snake_case',
});
