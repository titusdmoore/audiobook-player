// Book Providers
export const BOOK_PROVIDERS_CREATE = `CREATE TABLE book_providers(
	id INTEGER PRIMARY KEY NOT NULL,
	name TEXT NOT NULL,
	remote_path TEXT NOT NULL,
	last_pulled INTEGER
);`;

export type BookProviderDb = {
	id: number,
	name: string,
	remote_path: string,
	// TODO: figure out a way to get this into a date
	last_pulled: number | null
};

// Books
export const BOOKS_TABLE_CREATE = `CREATE TABLE books(
	id INTEGER PRIMARY KEY NOT NULL,
	title TEXT NOT NULL,
	duration INTEGER,
	author TEXT,
	local_path TEXT,
	provider_path TEXT,
	thumbnail_path TEXT,
	downloaded INTEGER,
	provider_id INTEGER,
	FOREIGN KEY (provider_id) REFERENCES book_providers(id)
);`;

export type BookDb = {
	id?: number,
	title: string,
	duration: number | null,
	author: string | null,
	local_path: string | null,
	provider_path: string | null,
	thumbnail_path: string | null,
	downloaded: number | null,
	provider_id: number | null,
}

// BookChapters
export const BOOK_CHAPTERS_CREATE = `CREATE TABLE book_chapters(
	id INTEGER PRIMARY KEY NOT NULL,
	title TEXT NOT NULL,
	duration INTEGER,
	local_path TEXT,
	remote_path TEXT,
	downloaded INTEGER,
	chapter_order INTEGER,
	book_id INTEGER,
	FOREIGN KEY (book_id) REFERENCES books(id)
);`;

export type ItemDb = {
	db_id?: number;

	// Jelly Fields
	name: string;
	server_id: string;
	etag: string;
	date_created: string;
	date_last_media_added: string;
	can_delete: number;
	can_download: number;
	parent_id: string | null;
	id: string;
	duration: number | null;
	sort_name: string;
	remote_path: string;

	// Local Storage Fields
	local_path: string | null;
	local_image_path: string | null;
	downloaded: boolean;

	// Helper Fields
	parent_db_id: number | null;
};

export const ITEMS_CREATE = `CREATE TABLE items(
	db_id INTEGER PRIMARY KEY NOT NULL,

	name TEXT NOT NULL,
	id TEXT NOT NULL,
	server_id TEXT,
	etag TEXT,
	date_created TEXT NOT NULL,
	date_last_media_added TEXT,
	can_delete INTEGER,
	can_download INTEGER NOT NULL,
	sort_name TEXT,
	duration INTEGER,
	parent_id TEXT,
	remote_path TEXT NOT NULL,

	local_path TEXT,
	downloaded INTEGER NOT NULL,
	local_image_path TEXT,

	parent_db_id INTEGER,
	FOREIGN KEY (parent_db_id) REFERENCES items(db_id)
);`;

export type BookChapterDb = {
	id?: number,
	title: string,
	duration: number | null,
	local_path: string | null,
	remote_path: string | null,
	downloaded: number | null,
	chapter_order: number | null,
	book_id: number | null,
}

// JellyfinBookProgress 
export const JELLYFIN_BOOK_PROGRESS_CREATE = `CREATE TABLE jellyfin_book_progress(
	id INTEGER PRIMARY KEY NOT NULL,
	position INTEGER NOT NULL,
	title_id TEXT NOT NULL,
	chapter_id TEXT NOT NULL
);`;
export type JellyfinBookProgressDb = {
	id?: number,
	position: number,
	title_id: string,
	chapter_id: string,
};

export const APP_OPTIONS = `CREATE TABLE app_options(
	id INTEGER PRIMARY KEY NOT NULL,
	option_name TEXT NOT NULL,
	option_value TEXT
);`;
export const APP_OPTIONS_CONSTRAINT = "CREATE UNIQUE INDEX ux_name_unique ON app_options(option_name);"
export type AppOptionsDb = {
	id?: number,
	option_name: string,
	option_value: string | null,
};
