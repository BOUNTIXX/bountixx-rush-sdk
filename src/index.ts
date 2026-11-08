export type RushChallengeType =
  | "coding"
  | "trivia"
  | "logic"
  | "math"
  | "writing"
  | "design"
  | "meme"
  | "mixed";

export type RushStatus = "draft" | "scheduled" | "live" | "settled" | "cancelled";

/** Activity primitives that can be composed into an organiser-led Community Rush. */
export type CommunityRushActivityType = "arena" | "quest" | "workshop" | "bounty";

export interface CommunityRushActivity {
  kind: CommunityRushActivityType;
  title: string;
  description: string;
  time: string;
  points: number;
}

/**
 * Public campaign metadata only. This is safe to display in web clients and
 * embeds; it deliberately excludes signer material and wallet credentials.
 */
export interface CommunityRushProgram {
  slug: string;
  name: string;
  community: string;
  status: "preview" | "live" | "upcoming";
  startsAt: string;
  endsAt: string;
  summary: string;
  rewardLabel: string;
  verification: "Bountixx score" | "Verified Rush";
  tracks: CommunityRushActivity[];
}

export interface RushManifest {
  campaignId: string;
  arenaId: string;
  title: string;
  challengeType: RushChallengeType;
  rulesVersion: 1;
  scoringMethod: string;
  startsAt: string;
  endsAt: string;
  prize: {
    asset: "XLM" | "USDC" | string;
    amount: string;
    network: "TESTNET" | "PUBLIC";
  };
  payout: "winner-takes-all" | "ranked";
  resultPolicy: "deterministic" | "organizer-reviewed";
}

export type RushManifestValidationIssue = {
  field: keyof RushManifest | "prize.amount";
  message: string;
};

export interface ResultAttestation {
  version: 1;
  manifestHash: string;
  campaignId: string;
  arenaId: string;
  winnerAddress: string;
  resultHash: string;
  issuedAt: string;
  verifierKeyId: string;
  signature: string;
}

/** Stable JSON for hashes and signatures. Keep this format backwards compatible. */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`)
    .join(",")}}`;
}

export function unsignedAttestation(attestation: Omit<ResultAttestation, "signature">): string {
  return canonicalize(attestation);
}

/**
 * Validates the publishable manifest invariants shared by the app and the
 * verifier. This does not decide whether a challenge is objectively scoreable:
 * verifier-specific scoring checks belong in bountixx-rush-verifier.
 */
export function validateRushManifest(manifest: RushManifest): RushManifestValidationIssue[] {
  const issues: RushManifestValidationIssue[] = [];
  const requiredText: Array<[keyof RushManifest, string]> = [
    ["campaignId", manifest.campaignId],
    ["arenaId", manifest.arenaId],
    ["title", manifest.title],
    ["scoringMethod", manifest.scoringMethod],
  ];

  for (const [field, value] of requiredText) {
    if (!value.trim()) issues.push({ field, message: "Must not be empty." });
  }

  if (manifest.rulesVersion !== 1) {
    issues.push({ field: "rulesVersion", message: "Only rules version 1 is currently supported." });
  }

  const startsAt = Date.parse(manifest.startsAt);
  const endsAt = Date.parse(manifest.endsAt);
  if (Number.isNaN(startsAt)) issues.push({ field: "startsAt", message: "Must be a valid ISO date-time." });
  if (Number.isNaN(endsAt)) issues.push({ field: "endsAt", message: "Must be a valid ISO date-time." });
  if (!Number.isNaN(startsAt) && !Number.isNaN(endsAt) && endsAt <= startsAt) {
    issues.push({ field: "endsAt", message: "Must be after startsAt." });
  }

  const amount = manifest.prize.amount.trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(amount) || /^0(?:\.0+)?$/.test(amount)) {
    issues.push({ field: "prize.amount", message: "Must be a positive decimal string." });
  }
  if (!manifest.prize.asset.trim()) {
    issues.push({ field: "prize", message: "A reward asset is required." });
  }

  return issues;
}
