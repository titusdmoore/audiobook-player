type ItemBase = {
	Name: string;
	ServerId: string;
	Id: string;
	ChannelId: object;
	IsFolder: boolean;
	Type: string;
	UserData: {
		PlayedPercentage: number;
		UnplayedItemCount: number;
		PlaybackPositionTicks: number;
		PlayCount: number;
		IsFavorite: boolean;
		Played: boolean;
		Key: string;
		ItemId: string;
	};
	ImageTags: object;
	BackdropImageTags: object;
	ImageBlurHashes: object;
	LocationType: string;
	MediaType: string;
};

export type ItemDir = ItemBase & {
	Etag: string;
	DateCreated: string;
	DateLastMediaAdded: string;
	CanDelete: boolean;
	CanDownload: boolean;
	SortName: string;
	ExternalUrls: object;
	ProductionLocations: object;
	Path: string;
	EnableMediaSourceDisplay: boolean;
	Taglines: object;
	Genres: object;
	PlayAccess: string;
	RemoteTrailers: object;
	ProviderIds: object;
	ParentId: string;
	People: object;
	Studios: object;
	GenreItems: object;
	LocalTrailerCount: number;
	RecursiveItemCount: number;
	ChildCount: number;
	SpecialFeatureCount: number;
	DisplayPreferencesId: string;
	Tags: object;
	PrimaryImageAspectRatio: number;
	LockedFields: object;
	LockData: boolean;
};

export type ItemChapter = ItemBase & {
	HasLyrics: boolean;
	PremiereDate: string;
	RunTimeTicks: number;
	ProductionYear: number;
	IndexNumber: number;
	Artists: object;
	ArtistItems: object;
	Album: string;
	AlbumArtist: string;
	AlbumArtists: object;
};

export type Item = ItemDir | ItemChapter;
