/**
 * Emoji for HTTP status codes
 * @see https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
 */
export const HTTPemojis = {
	100: ['🏁👉', 'continue'],
	101: ['🔠🔀', 'switching protocols'],
	102: ['📶♻', 'processing'],
	103: ['⏰❗', 'early hints'],
	104: ['⬆✅', 'upload resumption supported'],
	110: ['📞🥶', 'response is stale'], // apache
	111: ['⁉🤮', 'revalidation failed'], // apache
	112: ['🔀😵‍💫', 'disconnected operation'], // apache
	113: ['🖖⌛️', 'heuristic expiration'], // apache
	199: ['⏳⚠', 'miscellaneous warning'], // apache
	200: ['✅🙂', 'ok'],
	201: ['🆕🙏', 'created'],
	202: ['✅🙏', 'accepted'],
	203: ['ℹ🤷‍♀️', 'non-authoritative information'],
	204: ['💭🥱', 'no content'],
	205: ['🔄 😐', 'reset content'],
	206: ['📦🤔', 'partial content'],
	207: ['😳😳', 'multi-status'],
	208: ['🥱🥱', 'already reported'],
	214: ['🧬🙏', 'transformation applied'], // apache
	218: ['🙏😐', 'this is fine'], // apache
	226: ['🗜🙏', 'IM used'],
	299: ['⚠⁉', 'miscellaneous persistent warning'], // apache
	300: ['🔀⁉', 'multiple choices'],
	301: ['🚚🏠', 'moved permanently'],
	302: ['🔎✅', 'found'],
	303: ['👀🙏', 'see other'],
	304: ['🧬🙅‍♂️ ', 'not modified'],
	305: ['➡😇', 'use proxy'],
	306: ['🔀😇', 'switch proxy'],
	307: ['⌛🔀', 'temporary redirect'],
	308: ['🔀🏠', 'permanent redirect'],
	400: ['💩🤮', 'bad request'],
	401: ['🔐😨', 'unauthorised'],
	402: ['💰🤑', 'payment required'],
	403: ['⛔🙅‍♂️', 'forbidden'],
	404: ['🔎🤷‍♀️', 'not found'],
	405: ['❗🚫', 'method not allowed'],
	406: ['➡🚫', 'not acceptable'],
	407: ['😇🙅‍♂️', 'proxy authentication required'],
	408: ['➡⌛️', 'request timeout'],
	409: ['➡💥', 'conflict'],
	410: ['💨🙅‍♂️', 'gone'],
	411: ['📏🙅‍♂️', 'length required'],
	412: ['🔗🙅‍♂️', 'precondition required'],
	413: ['🗃🙅‍♂️', 'content too large'],
	414: ['🌐🚫', 'uri too long'],
	415: ['🎞🚫', 'unsupported media type'],
	416: ['📐🙅‍♂️', 'range not satisfiable'],
	417: ['🤔🚫', 'expectation failed'],
	418: ['🫖🤣', 'i am a teapot!'],
	419: ['📃🔥', 'page expired'], // laravel
	420: ['🙏😇', 'enhance your calm'], // twitter
	421: ['➡🔂', 'misdirected request'],
	422: ['💩🙅‍♂️', 'unprocessable content'],
	423: ['➡🔒', 'locked'],
	424: ['🔗🚫', 'failed dependency'],
	425: ['⏱🚫', 'too early'],
	426: ['📤🙅‍♂️', 'upgrade required'],
	428: ['⛓🙅‍♂️', 'precondition required'],
	429: ['🔀🙅‍♂️', 'too many requests'],
	430: ['🔒🙅‍♂️', 'shopify security rejection'], // shopify
	431: ['👱‍♂️🤮', 'request header fields too large'],
	440: ['👩‍💻⌛', 'login timeout'], // nginx, microsoft
	444: ['❓🤷‍♀️', 'no response'], // nginx
	449: ['⏭🤔', 'retry with'], // microsoft
	450: ['🚫👫', 'blocked by windows parental controls'], // microsoft
	451: ['🚫⚖️', 'unavailable for legal reasons'],
	460: ['🧑‍🏫🚫', 'client closed connection'], // aws
	463: ['⚖💥', 'load balancer x-forwarded for overload'], // aws
	464: ['🧑‍🏫🤷‍♀️', 'incompatible protocol between client and origin server'], // aws
	494: ['👱‍♂️🤮', 'request header too large'], // nginx
	495: ['🪪🚫', 'ssl certificate error'], // nginx
	496: ['🪪🙅‍♂️', 'ssl certificate required'], // nginx
	497: ['➡🔌', 'http request sent to https port'], // nginx
	498: ['💩🤮', 'invalid token'], // esri
	499: ['🧑‍🏫 🚫', 'client closed request'], // nginx
	500: ['💣💥', 'internal server error'],
	501: ['🚧🚫', 'not implemented'],
	502: ['🚧🤮', 'bad gateway'],
	503: ['🫴🚫', 'service unavailable'],
	504: ['🚧⌛', 'gateway timeout'],
	505: ['🔢🙅‍♂️', 'http version not supported'],
	506: ['🧬🙅‍♂️', 'variant also negotiates'],
	507: ['🗄🤷‍♀️', 'insufficient storage'],
	508: ['➿💥', 'loop detected'],
	509: ['🛣🙅‍♂️', 'bandwidth limit exceeded'], // apache
	510: ['🏗🙅‍♂️', 'not extended'],
	511: ['🔑🙅‍♂️', 'network authentication required'],
	520: ['🕸🤷‍♀️', 'web server returned an unknown error'], // cloudflare
	521: ['🕸⏬', 'web server is down'], // cloudflare
	522: ['🛜⌛', 'connection timed out'], // cloudflare
	523: ['🏠🙅‍♂️', 'origin is unreachable'], // cloudflare
	524: ['⌛⁉', 'a timeout occurred'], // cloudflare
	525: ['🪪🙅‍♂️', 'ssl handshake failed'], // cloudflare
	526: ['🪪💩', 'invalid ssl certificate'], // cloudflare
	527: ['🔫💥', 'railgun error'], // cloudflare
	529: ['🛗💥', 'site is overloaded'], // qualys
	530: ['🏠🥶', 'site is frozen'], // pantheon
	561: ['🙅‍♂️🚫', 'unauthorized'], // aws
	598: ['🕸⌛', 'network read timeout error'], // aws
	599: ['🕸⌛', 'network connect timeout error'], // aws
	783: ['💩🤮', 'unexpected token'], // cloudflare
	999: ['🤷‍♀️🤷‍♀️', 'non standard'] // linkedin
};

export const GenderEmojis = {
	male: '👨',
	female: '👩',
	unknown: '🤷‍♂️',
	other: '🧑‍🤝‍🧑'
};

export const SubscriptionStatusEmojis = {
	active: '🟢',
	incomplete: '🤷‍♂️',
	incomplete_expired: '💀',
	trialing: '🤔',
	unpaid: '😡',
	paused: '⏸️',
	past_due: '⏳',
	canceled: '🔴'
};

export const SubscriptionTypeEmojis = {};
