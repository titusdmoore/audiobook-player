import { Directory, Paths, File } from "expo-file-system";

export const ROOT_AUDIOBOOK_DIR = new Directory(Paths.document, "Audiobooks");

export function mimeToExtension(mime: string): string {
	switch (mime) {
		case 'image/jpeg': return '.jpg';
		case 'image/png': return '.png';
		case 'image/svg+xml': return '.svg';
		case 'image/webp': return '.webp';
		case 'image/avif': return '.avif';
	}

	return '';
}

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
