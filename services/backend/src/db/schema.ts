import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const imageTable = sqliteTable(
	'image',
	{
		id: int().primaryKey({ autoIncrement: true }),
		key: text().notNull(),
		createdAt: text()
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
	},
	(table) => {
		return { idxCreatedAt: index('idx_created_at').on(table.createdAt) };
	},
);
