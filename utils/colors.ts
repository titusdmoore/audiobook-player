import { DarkTheme, type Theme } from '@react-navigation/native';

export const PALETTE_OLD = {
	background: '#15151c',
	backgroundDark: '#010104',
	primary: '#3a31d8',
	secondary: '#020024',
	accent: '#0600c2',
	text: '#ebe9fc',
};

export const PALETTE = {
	background: '#0A0A0F',
	backgroundLight: '#16161F',
	primary: '#6C5CE7',
	secondary: '#020024',
	accent: '#0600c2',
	text: '#ebe9fc',
	textWhite: '#ebe9fc',
	textOffWhite: '#9CA3AF',
	success: '#22C55E',
	grey: '#262626',
};

export const AudiobookPlayerTheme: Theme = {
	...DarkTheme,
	colors: {
		primary: PALETTE.primary,
		background: PALETTE.background,
		card: PALETTE.backgroundLight,
		text: PALETTE.text,
		border: PALETTE.secondary,
		notification: PALETTE.accent
	}
};
