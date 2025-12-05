// import { fetch } from "expo/fetch";

import { encodeObjectToQueryParams } from "..";

export type AuthenticateUserByNameResponse = {
	user: any | null;
	accessToken: string | null;
	errors?: { message: string };
};

export async function authenticateUserByName(domain: string, username: string, password: string) {
	try {
		let authResponse = await fetch(`${domain}/Users/AuthenticateByName`, {
			method: 'POST',
			body: JSON.stringify({ Username: username, Pw: password }),
			headers: new Headers({
				'accept': 'application/json',
				'Content-Type': 'application/json',
				'x-emby-authorization': 'Mediabrowser Client="audiobook-player", Device="mydevice", DeviceId="myid", Version="1.0.0"'
			}),
		});

		if (authResponse && authResponse.ok) {
			let { User, AccessToken } = await authResponse.json();
			return { user: User, accessToken: AccessToken };
		}

		return { user: null, errors: { message: 'Something went wrong with logging in.' } };
	} catch (error: any) {
		// Return error instead of throwing
		return { user: null, errors: { message: `Fetch failed: ${error.message}` } };
	}
}

export async function fetchItem(domain: string, accessToken: string, userId: string, id: string) {
	let response = await fetch(`${domain}/Users/${userId}/Items/${id}`, {
		headers: new Headers({
			'accept': 'application/json',
			'Authorization': `MediaBrowser Token="${accessToken}"`
		})
	});

	return response;
}

export async function getUserById(domain: string, id: string, accessToken: string) {
	let response = await fetch(`${domain}/Users/${id}`, {
		headers: new Headers({
			'accept': 'application/json',
			'Authorization': `MediaBrowser Token="${accessToken}"`
		})
	});

	return response;
}

export type FetchAudiobookOptions = {
	parentId?: string;
	limit?: number;
	startIndex?: number;
	enableTotalRecordCount?: boolean;
	enableImages?: boolean;
};

export async function fetchAudiobooks(domain: string, accessToken: string, options?: FetchAudiobookOptions) {
	const defaultOptions: FetchAudiobookOptions = {
		parentId: '4e985111ed7f570b595204d82adb02f3',
		limit: 14,
		startIndex: 0,
	};

	let mergedOptions = {
		...defaultOptions,
		...options
	};

	let response = await fetch(`${domain}/Items?${encodeObjectToQueryParams(mergedOptions)}`, {
		method: 'GET',
		headers: new Headers({
			'accept': 'application/json',
			'Authorization': `MediaBrowser Token="${accessToken}"`
		})
	});

	return response;
}

// Position is in Ticks which are Microseconds
export async function reportItemPlaying(domain: string, accessToken: string, userId: string, itemId: string, position: number) {
	let response = await fetch(`${domain}/Sessions/Playing`, {
		method: 'POST',
		body: JSON.stringify({ userId, ItemId: itemId }),
		headers: new Headers({
			'accept': 'application/json',
			'Authorization': `MediaBrowser Token="${accessToken}"`
		})
	});

	console.log('res', response)
	console.log(await response.json())
}

export async function downloadTitle() {

}
