import { DarkTheme, type Theme } from '@react-navigation/native';

export const PALETTE = {
	background: '#15151c',
	backgroundDark: '#010104',
	primary: '#3a31d8',
	secondary: '#020024',
	accent: '#0600c2',
	text: '#ebe9fc',
};

export const AudiobookPlayerTheme: Theme = {
	...DarkTheme,
	colors: {
		primary: PALETTE.primary,
		background: PALETTE.background,
		card: PALETTE.backgroundDark,
		text: PALETTE.text,
		border: PALETTE.secondary,
		notification: PALETTE.accent
	}
};
