import { SQLiteDatabase, SQLiteRunResult } from 'expo-sqlite';
import { BOOK_CHAPTERS_CREATE, BOOK_PROVIDERS_CREATE, BookChapterDb, BookDb, BOOKS_TABLE_CREATE, JELLYFIN_BOOK_PROGRESS_CREATE, JellyfinBookProgressDb } from './schema';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
	// BUMP IF MIGRATION NEEDED
	const DATABASE_VERSION = 3;
	console.log("here")

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

	if (currentDbVersion === 0) {
		await db.execAsync(`
			PRAGMA journal_mode = 'wal';

			${BOOK_PROVIDERS_CREATE}
			${BOOKS_TABLE_CREATE}
			${BOOK_CHAPTERS_CREATE}
			${JELLYFIN_BOOK_PROGRESS_CREATE}
		`);
	}

	if (currentDbVersion === 2) {
		await db.execAsync(`
			PRAGMA journal_mode = 'wal';

			${JELLYFIN_BOOK_PROGRESS_CREATE}
		`);
	}

	await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
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

// export async function
