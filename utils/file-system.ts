import { Directory, Paths, File } from "expo-file-system";

export const ROOT_AUDIOBOOK_DIR = new Directory(Paths.document, "Audiobooks");

export function getAudiobookDir(title: string, create: boolean) {
	let dir = new Directory(ROOT_AUDIOBOOK_DIR, safeEncodeFileName(title));

	if (create) {
		dir.create({
			idempotent: true,
			intermediates: true,
		});
	}

	return dir;
}

export function safeEncodeFileName(fileName: string): string {
	return fileName.replace(/(\[\w+\])?/g, '');
}
