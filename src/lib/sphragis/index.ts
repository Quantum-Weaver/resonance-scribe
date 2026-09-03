// the-sphragis — the license grammar: the license is DATA, the text a rendering.
//
// THE LAWS:
//   · THREE GRANTS, NEVER ONE. `draw` returns exactly three, always, in one
//     canonical order: artist→platform · platform→listener · artist→buyer.
//     A declaration that names one still yields three; the unnamed ones are
//     drawn empty and TOLD, never omitted.
//   · THE ARTIST→PLATFORM GRANT IS REVOCABLE, AND THE ENVELOPE ENDS IT.
//     Revocability is fixed BY LAW, not by the declaration, and only that
//     grant may carry an envelope at all.
//   · THE COPYRIGHT NEVER MOVES. `holder` is set once, at drawing, and no
//     exported path changes it. Every grant is non-exclusive, typed as the
//     literal `false` so the compiler itself refuses the other value.
//   · THE SEAL IS EVIDENCE, NEVER A LOCK — NO DRM ANYWHERE. Nothing on this
//     surface gates access to anything, and ending the platform's grant never
//     reaches into what a listener already holds.
//   · THE 90/10 SPLIT STAYS SCHEMA RATHER THAN PROMISE. A split that does not
//     sum to 100 is TOLD in plain words, never quietly normalized.
//   · THE SAME TERMS RENDER IDENTICALLY EVERY TIME. `draw` normalizes and
//     `canonical` sorts every key at every depth, so two declarations of the
//     same terms produce byte-identical DOCUMENTS.
//   · EVERYTHING IS TOLD. A refusal is a calm no with a reason on `flagged`,
//     never a throw and never a silent nothing.
//
// THE LAWYER GATE: this tool does not produce legal text the world may rely
// on. What `render` emits is a RENDERING of structured terms — not legal
// advice, not a lawyer's work, and reviewed by no lawyer. That warning rides
// on every rendering structurally, with no option to suppress it.
//
// NO CRYPTOGRAPHY: this water implements none and computes no hash and no
// signature. The signature, content hash and timestamp are OPAQUE VALUES THE
// CONSUMER SUPPLIES; `evidence` compares the declared canonical form against
// what the terms canonicalize to now, and that comparison is string equality.
//
// STANDALONE BY LAW: zero imports, framework-free, pure functions. No DOM, no
// disk, no network, no clock — every moment is DECLARED by the consumer.
// Logging is designed in and default OFF: nothing here writes a line.

/** THE LAWYER GATE, as one string, exported so no consumer can claim it
 *  was hard to find. It rides inside every `Rendering` — in `.gate` and
 *  in `.text` — and there is no parameter anywhere on this surface that
 *  suppresses it. A warning that can be switched off has already been
 *  softened. */
export const LAWYER_GATE =
	'THE LAWYER GATE — this is a RENDERING of structured terms, not legal advice and not a lawyer\'s work. No lawyer has reviewed it. It wants a real lawyer\'s eyes before the world relies on it. Until that happens it is a draft, and relying on it is relying on nothing.';

/** THE NO-DRM LINE, likewise exported and likewise unremovable. It is
 *  in every rendering and in every evidence report. */
export const NO_DRM =
	'The seal is evidence, never a lock. Nothing in this licence grants or withholds access to anything, and no grant ending here reaches into a copy someone already holds.';

/** Designed in, shipped silent — see the header. Nothing in this module
 *  writes anywhere; the told lines ARE the voice. */
export const LOGGING = false;

/** The four parties this grammar knows, and the only four. */
export type Party = 'artist' | 'platform' | 'listener' | 'buyer';

/** THE THREE GRANTS, by name. There is no fourth and there is no
 *  first-only. */
export type GrantName = 'artist-to-platform' | 'platform-to-listener' | 'artist-to-buyer';

/** THREE GRANTS, NEVER ONE — and always in this order, so every
 *  document and every text lands in the same shape. */
export const GRANT_ORDER: readonly GrantName[] = ['artist-to-platform', 'platform-to-listener', 'artist-to-buyer'];

/** Who gives and who receives, fixed by law rather than by declaration. */
const PARTIES: Record<GrantName, { from: Party; to: Party }> = {
	'artist-to-platform': { from: 'artist', to: 'platform' },
	'platform-to-listener': { from: 'platform', to: 'listener' },
	'artist-to-buyer': { from: 'artist', to: 'buyer' },
};

/** REVOCABILITY IS LAW, NOT OPTION. Only the artist→platform grant is
 *  revocable — the artist lends the platform a permission and may take
 *  it back. The other two are not, and that is the no-DRM law wearing
 *  its other face: what a listener or a buyer received is theirs. */
const REVOCABLE: Record<GrantName, boolean> = {
	'artist-to-platform': true,
	'platform-to-listener': false,
	'artist-to-buyer': false,
};

/** The thing being licensed — Khorós's release, Hermes's ware. `kind` is a
 *  plain string on purpose: this grammar never re-enumerates another realm's
 *  enum, because that would be a second copy of a truth it does not own. */
export interface Ergon {
	id: string;
	name: string;
	kind: string;
	[k: string]: unknown; // ridden whole — slug, price, currency, cover_url, isrc: the realm's own
}

/** How a grant ended. `when` is DECLARED — this water has no clock. */
export interface Ending {
	when: string;
	why: string;
	/** the artist's own hand, or the envelope's ending. Nothing else. */
	by: 'artist' | 'envelope';
	[k: string]: unknown;
}

/** One of the three. Never one of one. */
export interface SphragisGrant {
	name: GrantName;
	from: Party;
	to: Party;
	/** the verbs this grant permits, in the realm's own words — sorted
	 *  and de-duplicated at drawing, so identical intent is identical
	 *  data. An empty list is honest: it means nothing was declared. */
	permits: string[];
	/** fixed by law from the grant's name; a declaration cannot move it. */
	revocable: boolean;
	/** ALWAYS FALSE, and typed as the literal so the compiler itself
	 *  refuses the other value. An exclusive grant is how a copyright moves
	 *  while everyone insists it did not, so this field cannot be set. */
	exclusive: false;
	/** the envelope whose ENDING ends this grant. Only artist→platform
	 *  may carry one. Held as a bare id: this water never models an
	 *  envelope — that is `the-envelope`'s, and tools never import each
	 *  other. */
	envelope: string | null;
	/** null while the grant HOLDS. */
	ended: Ending | null;
	[k: string]: unknown; // ridden whole — territory, term, format: the realm's own
}

/** THE 90/10, AS SCHEMA. Numbers a reader can reach, not a sentence a
 *  reader must trust. */
export interface SphragisSplit {
	artist: number;
	platform: number;
	[k: string]: unknown; // ridden whole — a realm's residual pool, its collaborators' shares
}

/** THE CONTRIBUTORS, AS COLUMNS — law 1's other half, said out loud: the
 *  licence is DATA, and the people who made the work are COLUMNS rather than
 *  a sentence somebody re-argues after the record is out.
 *
 *  This is `the-merismos`'s `Merismos`, written out STRUCTURALLY so a value
 *  from that water assigns straight in — honoured BY SHAPE, never by import,
 *  the same way the envelope is honoured here as a bare id string. Standalone
 *  by law: this water imports no sibling and never will.
 *
 *  It divides `split.artist` and nothing else, AND IT DIVIDES IT EQUALLY. KP
 *  ⚛, verbatim: *"there is nothing to do but divide by the number of
 *  contributors, regardless of role."* There is no weight on a part, no
 *  percentage and no basis point — the divisor is the headcount, the main
 *  artisan is ONE OF THEM, and a `role` is recorded and never weighed. A
 *  legacy `points` field from before that ruling rides here whole through the
 *  index signature, ignored, the way every other realm key rides. */
export interface SphragisCollaborators {
	parts: Array<{
		who: { name: string; [k: string]: unknown };
		/** free text — 'vocals', 'engineer', 'cover'. Never a sealed enum, and
		 *  never weighed: it is remembered, not ranked. */
		role?: string;
		[k: string]: unknown;
	}>;
	[k: string]: unknown;
}

/** The house's own default, exported to be OPTED INTO rather than assumed.
 *  A realm that needs other numbers passes other numbers, and the rendering
 *  tells whichever ones it was given. */
export const HOUSE_SPLIT: SphragisSplit = { artist: 90, platform: 10 };

/** The seal: three DECLARED, OPAQUE values and the address of the row
 *  that witnesses them. Nothing here is computed by this module — see
 *  the header, stated plainly. */
export interface Seal {
	/** the exact canonical form these values were taken over. The
	 *  consumer declares it; `evidence` compares it, character for
	 *  character, against what the terms canonicalize to now. THAT
	 *  COMPARISON IS THE BINDING, and it is string equality rather than
	 *  cryptography. */
	over: string;
	/** declared by the consumer, opaque here. Never computed, never verified. */
	signature: string;
	/** declared by the consumer, opaque here. Never computed, never verified. */
	contentHash: string;
	/** declared by the consumer, opaque here. This module has no clock. */
	timestamp: string;
	/** the public ledger row that witnesses the seal — an address, not a
	 *  copy of the row. Null is honest: an unwitnessed seal stands on its
	 *  own word, and says so. */
	witness: string | null;
	[k: string]: unknown; // ridden whole — algorithm names, key ids, chain addresses
}

/** THE DOCUMENT. The licence, as data. The text is only ever a
 *  rendering of this. */
export interface Sphragis {
	ergon: Ergon;
	/** THE COPYRIGHT. Set once at drawing; no exported path moves it. */
	holder: string;
	/** exactly three, always, in `GRANT_ORDER`. */
	grants: SphragisGrant[];
	split: SphragisSplit;
	/** the collaborator splits, as columns — ABSENT when none was declared,
	 *  so a licence without collaborators canonicalizes byte-identically to
	 *  the way it always did. A `collaborators: null` key would have been a
	 *  change to every existing seal in the world. */
	collaborators?: SphragisCollaborators;
	seal: Seal | null;
	/** everything told — refusals, imbalances, absences. */
	flagged: string[];
	[k: string]: unknown; // ridden whole — the realm's own declaration keys, which are terms too
}

/** What a consumer hands to `draw`. */
export interface Declaration {
	ergon: Ergon;
	/** the copyright holder, named once. */
	holder: string;
	/** what each grant permits, in the realm's own verbs. Partial by
	 *  design: naming one does not mean drawing one. */
	permits?: Partial<Record<GrantName, string[]>>;
	/** the envelope whose ending ends the artist→platform grant. */
	envelope?: string | null;
	/** the shares, as numbers. `HOUSE_SPLIT` is there to be opted into. */
	split: SphragisSplit;
	/** how the ARTIST'S share is divided among the people who made the work —
	 *  the columns law 1 asks for. Optional: most licences carry none, and a
	 *  licence without one is byte-identical to what it was before this field
	 *  existed. */
	collaborators?: SphragisCollaborators | null;
	[k: string]: unknown; // ridden whole — a realm's own keys are terms and travel as terms
}

/** A rendered text, and the gate that is welded to it. */
export interface Rendering {
	title: string;
	lines: string[];
	/** the whole text — and THE LAWYER GATE IS INSIDE IT. There is no
	 *  way to obtain this string without the warning. */
	text: string;
	/** the gate again, on its own, for a consumer that wants to show it
	 *  louder. Never for removing it from the text. */
	gate: string;
}

/** What the seal proves, and — just as loudly — what it does not.
 *  There is deliberately NO allow / deny / authorize key anywhere on
 *  this shape, because this water decides nothing about access. */
export interface Evidence {
	sealed: boolean;
	/** does the seal's declared canonical form still match these terms? */
	bound: boolean;
	signature: string | null;
	contentHash: string | null;
	timestamp: string | null;
	witness: string | null;
	witnessed: boolean;
	/** everything told, always including NO_DRM and LAWYER_GATE. */
	told: string[];
}

// ── the canonical form ───────────────────────────────────────────────
// Sorted at every depth, so key insertion order cannot change a byte.

function canonicalValue(value: unknown): string {
	if (value === null || value === undefined) return 'null';
	if (Array.isArray(value)) return `[${value.map(canonicalValue).join(',')}]`;
	if (typeof value === 'object') {
		const held = value as Record<string, unknown>;
		const keys = Object.keys(held).sort();
		return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalValue(held[k])}`).join(',')}}`;
	}
	if (typeof value === 'string') return JSON.stringify(value);
	if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	return 'null'; // functions, symbols — a licence holds none of them
}

/** THE CANONICAL FORM — the exact string a content hash should be taken
 *  over, and the string a `Seal.over` is compared against.
 *
 *  The SEAL ITSELF IS EXCLUDED, because a seal cannot be taken over
 *  itself; so is `flagged`, because telling is derived commentary and
 *  not a term. Everything else — including the realm's own keys — is
 *  in, sorted at every depth. */
export function canonical(sphragis: Sphragis): string {
	const held: Record<string, unknown> = {};
	for (const key of Object.keys(sphragis)) {
		if (key === 'seal' || key === 'flagged') continue;
		held[key] = sphragis[key];
	}
	return canonicalValue(held);
}

// ── drawing ──────────────────────────────────────────────────────────

function orderOf(name: GrantName): number {
	return GRANT_ORDER.indexOf(name);
}

function tidyPermits(permits: string[] | undefined): string[] {
	if (!permits) return [];
	const seen = new Set<string>();
	for (const p of permits) if (typeof p === 'string' && p.length > 0) seen.add(p);
	return [...seen].sort();
}

/** DRAW — the whole grammar, one pure act. Three grants come out, every
 *  time, in canonical order, normalized so that identical intent is
 *  identical data.
 *
 *  A declaration's own extra keys ride through as terms — they are
 *  spread FIRST, so no stray key can ever displace a law field. A
 *  declaration carrying `grants: []` or a forged `seal` changes
 *  nothing, and the attempt is told. */
export function draw(declaration: Declaration): Sphragis {
	const flagged: string[] = [];
	const { ergon, holder, permits, envelope, split, collaborators, ...rest } = declaration;

	const envelopeId = envelope ?? null;
	const asked = permits ?? {};

	const grants: SphragisGrant[] = GRANT_ORDER.map((name) => {
		const tidy = tidyPermits(asked[name]);
		if (tidy.length === 0) flagged.push(`the ${name} grant was drawn with nothing permitted — it stands empty, and it stands, because there are three grants and never one`);
		const revocable = REVOCABLE[name];
		return {
			name,
			from: PARTIES[name].from,
			to: PARTIES[name].to,
			permits: tidy,
			revocable,
			exclusive: false,
			envelope: revocable ? envelopeId : null,
			ended: null,
		};
	});

	if (envelopeId !== null) flagged.push(`envelope "${envelopeId}" holds the artist-to-platform grant — when it ends, that grant ends, and the other two are untouched`);
	else flagged.push('no envelope was named, so the artist-to-platform grant ends only by the artist\'s own hand — it is revocable either way');

	for (const key of Object.keys(rest)) {
		if (key === 'grants' || key === 'seal' || key === 'holder' || key === 'flagged') {
			flagged.push(`a declaration key "${key}" was ignored — the law writes that field, not the declaration; the copyright never moves and the grants are never fewer than three`);
		}
	}

	const shares = { ...split };
	const sum = shares.artist + shares.platform;
	if (!Number.isFinite(shares.artist) || !Number.isFinite(shares.platform)) {
		flagged.push('the split is not two finite numbers — told exactly as given, never guessed at');
	} else if (sum !== 100) {
		flagged.push(`the split is artist ${shares.artist} + platform ${shares.platform} = ${sum}, not 100 — told in plain words and left exactly as declared, because a silent correction is how a promise gets back in`);
	}
	flagged.push(`the split is schema, not promise: artist ${shares.artist} · platform ${shares.platform}, in the data and in every rendering`);

	// THE CONTRIBUTORS ARE COLUMNS. Held whole, never validated here, never
	// normalized, and ABSENT when none was declared — so a licence without
	// collaborators canonicalizes exactly as it did before this field existed,
	// and every seal already taken over one still binds.
	let columns: SphragisCollaborators | undefined;
	if (collaborators) {
		const parts = Array.isArray(collaborators.parts) ? collaborators.parts.map((p) => ({ ...p })) : [];
		columns = { ...collaborators, parts };
		const named = parts
			.map((p) => {
				const name = p.who && typeof p.who.name === 'string' ? p.who.name : '(unnamed)';
				return typeof p.role === 'string' && p.role.length > 0 ? `${name} · ${p.role}` : name;
			})
			.join(' | ');
		flagged.push(
			`the contributors ride as columns of this licence: ${parts.length} of them, and the artist's share is divided EQUALLY among them — ${named}`
		);
		flagged.push('there is nothing to do but divide by the number of contributors, regardless of role — the main artisan is one of them, and a role here is recorded and never weighed; there is no ranking and no percentage share in this licence');
		flagged.push('the contributors are a DESCRIPTION OF SHARES, never a promise of money — this grammar moves nothing, and consent to a share is the-merismos\'s to record and never implied by appearing in this licence');
	}

	flagged.push(LAWYER_GATE);

	const drawn: Sphragis = {
		...rest,
		ergon,
		holder,
		grants,
		split: shares,
		seal: null,
		flagged,
	};
	if (columns) drawn.collaborators = columns;
	return drawn;
}

// ── the life of a grant ──────────────────────────────────────────────

function grantOf(sphragis: Sphragis, name: GrantName): SphragisGrant | undefined {
	return sphragis.grants.find((g) => g.name === name);
}

/** Does this grant still HOLD? */
export function holds(sphragis: Sphragis, name: GrantName): boolean {
	const grant = grantOf(sphragis, name);
	return !!grant && grant.ended === null;
}

function ending(sphragis: Sphragis, name: GrantName, end: Ending, tale: string, refusal: string): Sphragis {
	const grant = grantOf(sphragis, name);
	if (!grant) return { ...sphragis, flagged: [...sphragis.flagged, `there is no ${name} grant to end`] };
	if (!grant.revocable) return { ...sphragis, flagged: [...sphragis.flagged, refusal] };
	if (grant.ended !== null) return { ...sphragis, flagged: [...sphragis.flagged, `the ${name} grant already ended at ${grant.ended.when} — ${grant.ended.why}`] };
	return {
		...sphragis,
		grants: sphragis.grants.map((g) => (g.name === name ? { ...g, ended: end } : g)),
		flagged: [...sphragis.flagged, tale, NO_DRM],
	};
}

/** REVOKE — the artist's own hand, and only on the artist→platform
 *  grant. Asked of either other grant this is a CALM NO with the reason
 *  told: the document comes back unchanged except for the telling.
 *
 *  It does not move the copyright, because the copyright never moved.
 *  It does not touch the listener's grant or the buyer's, because what
 *  they hold is theirs. `when` is declared — this water has no clock. */
export function revoke(sphragis: Sphragis, name: GrantName, why: string, when: string): Sphragis {
	return ending(
		sphragis,
		name,
		{ when, why, by: 'artist' },
		`the ${name} grant was revoked by the artist at ${when} — ${why}; the copyright did not move, and no other grant was touched`,
		`the ${name} grant is not revocable — only artist-to-platform is, by law rather than by declaration. Nothing changed, and nothing was thrown`
	);
}

/** THE ENVELOPE ENDS THE GRANT — KP's own gloss on the hall walk:
 *  "leaving takes the work AND the grant." The envelope is the artist's
 *  whole export; when it ends, the platform's permission ends with it,
 *  and the two are one act rather than two favours.
 *
 *  This module is TOLD that an envelope ended; it never watches one,
 *  never models one, and never imports `the-envelope`. An envelope id
 *  that no grant carries is a calm no.
 *
 *  The ending reaches exactly one grant. The listener's copy and the
 *  buyer's copy are not reached, cannot be reached, and there is no
 *  verb on this surface that could reach them. */
export function envelopeEnded(sphragis: Sphragis, envelopeId: string, when: string): Sphragis {
	const carrying = sphragis.grants.filter((g) => g.envelope === envelopeId && g.ended === null);
	if (carrying.length === 0) {
		return { ...sphragis, flagged: [...sphragis.flagged, `no standing grant carries envelope "${envelopeId}" — nothing ended, and nothing was thrown`] };
	}
	let held = sphragis;
	for (const grant of carrying) {
		held = ending(
			held,
			grant.name,
			{ when, why: `envelope "${envelopeId}" ended`, by: 'envelope' },
			`envelope "${envelopeId}" ended at ${when}, and with it the ${grant.name} grant — the copyright did not move, and the listener's and buyer's grants stand`,
			`the ${grant.name} grant is not revocable, so no envelope ends it`
		);
	}
	return held;
}

// ── the seal ─────────────────────────────────────────────────────────

/** BIND — hold a declared seal against these terms. It never rejects
 *  and never throws: a seal taken over different terms is RECORDED and
 *  TOLD, because a seal is evidence and evidence that disagrees is
 *  still evidence. `evidence()` reports the disagreement plainly.
 *
 *  Nothing is computed here. See the header, stated plainly. */
export function bind(sphragis: Sphragis, seal: Seal): Sphragis {
	const now = canonical(sphragis);
	const bound = seal.over === now;
	const held: Sphragis = { ...sphragis, seal: { ...seal } };
	const tale = bound
		? 'the seal was taken over exactly these terms — bound by comparison, which is string equality and not cryptography'
		: 'THE SEAL WAS TAKEN OVER DIFFERENT TERMS than these — recorded, not rejected, and told: evidence that disagrees is still evidence';
	return { ...held, flagged: [...sphragis.flagged, tale, seal.witness ? `witnessed by the public ledger row ${seal.witness}` : 'unwitnessed — the seal stands on its own word, and says so'] };
}

/** EVIDENCE — what the seal shows, and what it does not. There is no
 *  allow, no deny, no authorize, no entitle on this shape or in this
 *  return, because this water decides nothing about access to anything. */
export function evidence(sphragis: Sphragis): Evidence {
	const seal = sphragis.seal;
	const told: string[] = [];
	if (!seal) {
		told.push('unsealed — there is no signature, no content hash and no timestamp here, and the licence still stands as terms');
	} else {
		const bound = seal.over === canonical(sphragis);
		told.push(bound ? 'the seal is bound to these terms — the canonical form it was taken over still matches, character for character' : 'THE SEAL IS NOT BOUND TO THESE TERMS — it was taken over a different canonical form. Told, never hidden');
		told.push('the signature, the content hash and the timestamp are DECLARED VALUES held here and computed elsewhere — this module implements no cryptography and verifies none');
		told.push(seal.witness ? `the public ledger row ${seal.witness} is the witness` : 'unwitnessed — no public ledger row was named');
	}
	told.push(NO_DRM);
	told.push(LAWYER_GATE);
	return {
		sealed: !!seal,
		bound: !!seal && seal.over === canonical(sphragis),
		signature: seal ? seal.signature : null,
		contentHash: seal ? seal.contentHash : null,
		timestamp: seal ? seal.timestamp : null,
		witness: seal ? seal.witness : null,
		witnessed: !!seal && seal.witness !== null,
		told,
	};
}

// ── the rendering ────────────────────────────────────────────────────

function arrow(name: GrantName): string {
	return `${PARTIES[name].from} → ${PARTIES[name].to}`;
}

/** RENDER — the text, which is only ever a rendering of the data. The
 *  same terms render identically every time; there is no parameter here
 *  that could make them not.
 *
 *  THE LAWYER GATE IS IN `.text`, not merely beside it. */
export function render(sphragis: Sphragis): Rendering {
	const lines: string[] = [];
	const title = `LICENCE TERMS — ${sphragis.ergon.name}`;

	lines.push(title);
	lines.push('');
	lines.push(`Work: ${sphragis.ergon.name} (${sphragis.ergon.kind}) · id ${sphragis.ergon.id}`);
	lines.push(`Copyright: ${sphragis.holder}. The copyright does not move under this licence, and nothing in this grammar can move it.`);
	lines.push('');
	lines.push(`THE GRANTS — three, never one.`);

	const ordered = [...sphragis.grants].sort((a, b) => orderOf(a.name) - orderOf(b.name));
	ordered.forEach((grant, i) => {
		lines.push('');
		lines.push(`  ${i + 1} of ${ordered.length} — ${arrow(grant.name)} (${grant.name})`);
		lines.push(`      permits: ${grant.permits.length ? grant.permits.join(', ') : 'nothing was declared'}`);
		lines.push('      exclusive: no. This grant conveys no ownership and no rights assignment.');
		lines.push(`      revocable: ${grant.revocable ? 'yes, by the artist' : 'no — what was received is kept'}`);
		if (grant.envelope) lines.push(`      envelope: ${grant.envelope} — when it ends, this grant ends`);
		lines.push(grant.ended ? `      ENDED ${grant.ended.when} by the ${grant.ended.by} — ${grant.ended.why}` : '      holds');
	});

	lines.push('');
	lines.push(`THE SPLIT — artist ${sphragis.split.artist} · platform ${sphragis.split.platform}. These are numbers in the licence itself, not a promise made about it.`);
	lines.push('');

	// Only when there are collaborators. A licence with none renders exactly
	// as it always did, byte for byte.
	const columns = sphragis.collaborators;
	if (columns) {
		const parts = Array.isArray(columns.parts) ? columns.parts : [];
		lines.push(`THE CONTRIBUTORS — the artist's share, DIVIDED EQUALLY among ${parts.length}. Columns in the licence, not a sentence about it. No ranking, no percentage shares; the main artisan is one of them.`);
		parts.forEach((part) => {
			const name = part.who && typeof part.who.name === 'string' ? part.who.name : '(unnamed)';
			const role = typeof part.role === 'string' && part.role.length > 0 ? ` · ${part.role}` : '';
			lines.push(`      an equal share — ${name}${role}`);
		});
		lines.push('      A role is recorded here and never weighed: there is nothing to do but divide by the number of contributors, regardless of role.');
		lines.push('      These are shares described, never money promised. Nothing in this licence pays anybody, and a share here is opt-in — consent is recorded elsewhere and is never implied by appearing on this page.');
		lines.push('');
	}

	const seal = sphragis.seal;
	lines.push('THE SEAL');
	if (!seal) {
		lines.push('      unsealed — no signature, no content hash, no timestamp.');
	} else {
		lines.push(`      signature: ${seal.signature}`);
		lines.push(`      content hash: ${seal.contentHash}`);
		lines.push(`      timestamp: ${seal.timestamp}`);
		lines.push(`      witness: ${seal.witness ?? 'unwitnessed — the seal stands on its own word'}`);
		lines.push(`      bound to these terms: ${seal.over === canonical(sphragis) ? 'yes' : 'NO — this seal was taken over different terms'}`);
		lines.push('      these three values were declared by the holder and computed elsewhere; this grammar implements no cryptography and verifies none.');
	}
	lines.push(`      ${NO_DRM}`);
	lines.push('');
	lines.push(LAWYER_GATE);

	return { title, lines, text: lines.join('\n'), gate: LAWYER_GATE };
}
