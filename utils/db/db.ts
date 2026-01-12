import { openDatabaseAsync, SQLiteDatabase, SQLiteRunResult, useSQLiteContext } from 'expo-sqlite';
import { APP_OPTIONS, APP_OPTIONS_CONSTRAINT, AppOptionsDb, BOOK_CHAPTERS_CREATE, BOOK_PROVIDERS_CREATE, BookChapterDb, BookDb, BOOKS_TABLE_CREATE, ItemDb, ITEMS_CREATE, JELLYFIN_BOOK_PROGRESS_CREATE, JellyfinBookProgressDb } from './schema';
import { getItemAsync, setItemAsync } from 'expo-secure-store';
import { getRandomBytesAsync } from 'expo-crypto';

export const ENCRYPTION_KEY_NAME = 'db_encryption_key';

/* export async function callableWithDb(callback: CallableFunction, ...args: any[]) {
	// Try to pass db using context, otherwise create db instance
	try {
		const db = useSQLiteContext();

		return Promise.resolve(callback(...args, db));
	} catch (_) {
		const db = await openDatabaseAsync('abp_secure.db', {
			useNewConnection: true
		});

		return Promise.resolve(callback(...args, db));
	}
} */


export async function migrateDbIfNeeded(db: SQLiteDatabase) {
	// BUMP IF MIGRATION NEEDED
	const DATABASE_VERSION = 7;
	console.log("here")

	await db.execAsync(`PRAGMA key = '${await getOrCreateDatabaseKey()}'`)

	// NOTE: CHANGE TO TRUE TO RESET DB
	if (false) {
		await resetDB(db);
		await db.execAsync(`PRAGMA user_version = 0`);
	}

	let versionResponse = await db.getFirstAsync<{ user_version: number }>(
		'PRAGMA user_version'
	);

	if (!versionResponse) {
		return;
	}

	let currentDbVersion = versionResponse!.user_version;
	console.log("Version", currentDbVersion)

	if (currentDbVersion >= DATABASE_VERSION) {
		return;
	}

	if (currentDbVersion <= 0) {

		await db.execAsync(`
			PRAGMA journal_mode = 'wal';

			${BOOK_PROVIDERS_CREATE}
			${BOOKS_TABLE_CREATE}
			${BOOK_CHAPTERS_CREATE}
		`);
	}

	if (currentDbVersion <= 2) {
		await db.execAsync(`
			PRAGMA journal_mode = 'wal';

			${JELLYFIN_BOOK_PROGRESS_CREATE}
		`);
	}

	if (currentDbVersion <= 3) {
		await db.execAsync(`
			PRAGMA journal_mode = 'wal';

			${APP_OPTIONS}
		`);
	}

	if (currentDbVersion <= 5) {
		await db.execAsync(`
			PRAGMA journal_mode = 'wal';

			${APP_OPTIONS_CONSTRAINT}
		`);
	}

	if (currentDbVersion <= 6) {
		await db.execAsync(`
			PRAGMA journal_mode = 'wal';

			${ITEMS_CREATE}
		`);
	}

	await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export async function resetDB(db: SQLiteDatabase) {
	await db.execAsync(`
		DROP TABLE IF EXISTS book_providers;
		DROP TABLE IF EXISTS books;
		DROP TABLE IF EXISTS book_chapters;
		DROP TABLE IF EXISTS jellyfin_book_progress;
		DROP TABLE IF EXISTS app_options;
		DROP TABLE IF EXISTS items;
	`);
}

export async function addBookProvider(db: SQLiteDatabase, data: { name: string, remotePath: string, lastPulled?: number }) {
	return await db.runAsync(
		'INSERT INTO book_providers(name, remote_path, last_pulled) VALUES (?, ?, ?)',
		data.name,
		data.remotePath,
		data.lastPulled ?? null
	);
}

export async function addBook(db: SQLiteDatabase, data: BookDb): Promise<SQLiteRunResult> {
	return await db.runAsync(
		'INSERT INTO books(title, duration, author, local_path, provider_path, thumbnail_path, downloaded, provider_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
		data.title,
		data.duration,
		data.author,
		data.local_path,
		data.provider_path,
		data.thumbnail_path,
		data.downloaded,
		data.provider_id
	);
}

export async function setBookThumbnail(db: SQLiteDatabase, thumbnail_path: string, bookId: number): Promise<SQLiteRunResult> {
	return await db.runAsync(
		'UPDATE books SET thumbnail_path = ? WHERE id = ?;',
		thumbnail_path,
		bookId,
	);
}

export async function getBooks(db: SQLiteDatabase): Promise<any[]> {
	return db.getAllAsync('SELECT * FROM books;');
}

export async function addBookChapter(db: SQLiteDatabase, data: BookChapterDb) {
	return await db.runAsync(
		'INSERT INTO book_chapters(title, duration, local_path, remote_path, downloaded, chapter_order, book_id) VALUES (?, ?, ?, ?, ?, ?, ?);',
		data.title,
		data.duration,
		data.local_path,
		data.remote_path,
		data.downloaded,
		data.chapter_order,
		data.book_id
	);
}

export async function fetchPlayerDuration(db: SQLiteDatabase, titleId: string): Promise<JellyfinBookProgressDb | null> {
	return await db.getFirstAsync('SELECT * FROM jellyfin_book_progress WHERE title_id = ?;', titleId)
}

export async function createTitleDuration(db: SQLiteDatabase, data: JellyfinBookProgressDb) {
	return await db.runAsync(
		'INSERT INTO jellyfin_book_progress(position, title_id, chapter_id) VALUES (?, ?, ?);',
		data.position,
		data.title_id,
		data.chapter_id,
	);
}

export async function updateTitleDuration(db: SQLiteDatabase, id: number, chapterId: string, position: number) {
	return await db.runAsync(
		`UPDATE jellyfin_book_progress
			SET chapter_id = ?, position = ?
			WHERE id = ?;
		`,
		chapterId,
		position,
		id,
	);
}

export async function setAppOption(db: SQLiteDatabase, option_name: string, option_value: string) {
	return await db.runAsync(`INSERT OR REPLACE INTO app_options (option_name, option_value) 
		VALUES (?, ?);`,
		option_name,
		option_value
	);
}

export async function getAppOption(db: SQLiteDatabase, option_name: string): Promise<AppOptionsDb | null> {
	return await db.getFirstAsync('SELECT * FROM app_options WHERE option_name = ?;', option_name);
}

export async function getOrCreateDatabaseKey(): Promise<string> {
	// Check if we already have a key
	let key = await getItemAsync(ENCRYPTION_KEY_NAME);

	if (!key) {
		// Generate a new random 256-bit key
		const randomBytes = await getRandomBytesAsync(32);
		key = Array.from(randomBytes)
			.map(byte => byte.toString(16).padStart(2, '0'))
			.join('');

		// Store it securely for future use
		await setItemAsync(ENCRYPTION_KEY_NAME, key);
	}

	return key;
}

export async function createItem(db: SQLiteDatabase, item: ItemDb) {
	console.log(typeof db)
	return await db.runAsync(
		`INSERT INTO items(
			name, 
			id,
			server_id,
			etag,
			date_created,
			date_last_media_added,
			can_delete,
			can_download,
			sort_name,
			duration,
			parent_id,
			remote_path,
			local_path,
			downloaded,
			local_image_path,
			parent_db_id
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
		item.name,
		item.id,
		item.server_id,
		item.etag,
		item.date_created,
		item.date_last_media_added,
		item.can_delete,
		item.can_download,
		item.sort_name,
		item.duration,
		item.parent_id,
		item.remote_path,
		item.local_path,
		item.downloaded,
		item.local_image_path,
		item.parent_db_id
	);
}

export async function getDownloadedTitles(db: SQLiteDatabase) {
	return await db.getAllAsync('SELECT * FROM items WHERE parent_db_id IS NULL AND downloaded = 1;');
}

export async function getDownloadedTitleById(db: SQLiteDatabase, id: string): Promise<ItemDb | null> {
	// Convert request to get by id
	return await db.getFirstAsync('SELECT * FROM items WHERE id = ? AND downloaded = 1;', id);
}

export async function getChaptersForTitle(db: SQLiteDatabase, id: string): Promise<ItemDb[] | null> {
	// Convert request to get by id
	return await db.getAllAsync('SELECT * FROM items WHERE parent_db_id = ?;', id);
}
