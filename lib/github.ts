const GH = "https://api.github.com";
const OWNER = "manazoid4";
export const PINNED = ["flowlens", "JobFilterV1", "inkweave"];

export interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  pushed_at: string;
  private: boolean;
  archived: boolean;
  fork: boolean;
}

export interface DeployInfo {
  state: string | null; // success | failure | error | in_progress | pending | null (no deployments)
  environment: string | null;
  created_at: string | null;
}

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

const revalidate = { next: { revalidate: 300 } };

export async function getRepos(): Promise<Repo[]> {
  // With a token, /user/repos includes private repos; anonymous falls back to public.
  const url = process.env.GITHUB_TOKEN
    ? `${GH}/user/repos?affiliation=owner&sort=pushed&per_page=100`
    : `${GH}/users/${OWNER}/repos?sort=pushed&per_page=100`;
  const res = await fetch(url, { headers: headers(), ...revalidate });
  if (!res.ok) throw new Error(`GitHub repos fetch failed: ${res.status}`);
  const repos = (await res.json()) as Repo[];
  return repos.filter((r) => !r.fork && !r.archived);
}

/** Open PR count per repo, from one search call instead of N list calls. */
export async function getOpenPRCounts(): Promise<Map<string, number>> {
  const res = await fetch(
    `${GH}/search/issues?q=user:${OWNER}+is:pr+is:open&per_page=100`,
    { headers: headers(), ...revalidate }
  );
  const counts = new Map<string, number>();
  if (!res.ok) return counts; // search is rate-limited anonymously; degrade to zeros
  const data = (await res.json()) as { items: { repository_url: string }[] };
  for (const item of data.items) {
    const repo = item.repository_url.split("/").pop()!;
    counts.set(repo, (counts.get(repo) ?? 0) + 1);
  }
  return counts;
}

/** Latest deployment status; pinned repos only to preserve rate budget. */
export async function getDeployInfo(repo: string): Promise<DeployInfo> {
  const none: DeployInfo = { state: null, environment: null, created_at: null };
  const dRes = await fetch(
    `${GH}/repos/${OWNER}/${repo}/deployments?per_page=1`,
    { headers: headers(), ...revalidate }
  );
  if (!dRes.ok) return none;
  const deployments = (await dRes.json()) as {
    id: number;
    environment: string;
    created_at: string;
  }[];
  if (deployments.length === 0) return none;
  const d = deployments[0];
  const sRes = await fetch(
    `${GH}/repos/${OWNER}/${repo}/deployments/${d.id}/statuses?per_page=1`,
    { headers: headers(), ...revalidate }
  );
  const statuses = sRes.ok
    ? ((await sRes.json()) as { state: string }[])
    : [];
  return {
    state: statuses[0]?.state ?? "pending",
    environment: d.environment,
    created_at: d.created_at,
  };
}

export function recency(pushedAt: string): {
  label: string;
  tone: "ok" | "warn" | "stale";
} {
  const ms = Date.now() - new Date(pushedAt).getTime();
  const hours = ms / 3_600_000;
  const days = hours / 24;
  const label =
    hours < 1
      ? "just now"
      : hours < 48
        ? `${Math.round(hours)}h ago`
        : days < 60
          ? `${Math.round(days)}d ago`
          : `${Math.round(days / 30)}mo ago`;
  return { label, tone: hours < 48 ? "ok" : days < 14 ? "warn" : "stale" };
}
