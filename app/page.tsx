import {
  getRepos,
  getOpenPRCounts,
  getDeployInfo,
  recency,
  PINNED,
  type Repo,
  type DeployInfo,
} from "@/lib/github";

export const revalidate = 300;

function Dot({ tone }: { tone: string }) {
  return <span className={`dot ${tone}`} />;
}

function deployTone(state: string | null): string {
  if (state === "success") return "ok";
  if (state === "failure" || state === "error") return "stale";
  if (state === null) return "none";
  return "warn";
}

function PinCard({
  repo,
  prs,
  deploy,
}: {
  repo: Repo;
  prs: number;
  deploy: DeployInfo;
}) {
  const r = recency(repo.pushed_at);
  return (
    <a href={repo.html_url} target="_blank" rel="noreferrer">
      <div className="pin">
        <h2>{repo.name}</h2>
        <p className="desc">{repo.description ?? "—"}</p>
        <div className="row">
          <span className="k">last push</span>
          <span>
            <Dot tone={r.tone} />
            {r.label}
          </span>
        </div>
        <div className="row">
          <span className="k">open PRs</span>
          <span className="prbadge">{prs}</span>
        </div>
        <div className="row">
          <span className="k">deploy</span>
          <span>
            <Dot tone={deployTone(deploy.state)} />
            {deploy.state ?? "none"}
            {deploy.environment ? ` (${deploy.environment})` : ""}
          </span>
        </div>
      </div>
    </a>
  );
}

export default async function Page() {
  const [repos, prCounts] = await Promise.all([getRepos(), getOpenPRCounts()]);
  const pinned = PINNED.map((name) =>
    repos.find((r) => r.name.toLowerCase() === name.toLowerCase())
  ).filter((r): r is Repo => Boolean(r));
  const deploys = await Promise.all(pinned.map((r) => getDeployInfo(r.name)));
  const rest = repos.filter((r) => !pinned.includes(r));

  return (
    <main>
      <header className="deck">
        <h1>Portfolio Deck</h1>
        <span className="stamp">
          {repos.length} repos · refreshed every 5 min
        </span>
      </header>

      <section className="pins">
        {pinned.map((repo, i) => (
          <PinCard
            key={repo.name}
            repo={repo}
            prs={prCounts.get(repo.name) ?? 0}
            deploy={deploys[i]}
          />
        ))}
      </section>

      <table>
        <thead>
          <tr>
            <th>repo</th>
            <th>last push</th>
            <th className="num">open PRs</th>
            <th>visibility</th>
          </tr>
        </thead>
        <tbody>
          {rest.map((repo) => {
            const r = recency(repo.pushed_at);
            return (
              <tr key={repo.name}>
                <td>
                  <a href={repo.html_url} target="_blank" rel="noreferrer">
                    {repo.name}
                  </a>
                </td>
                <td>
                  <Dot tone={r.tone} />
                  {r.label}
                </td>
                <td className="num prbadge">
                  {prCounts.get(repo.name) ?? 0}
                </td>
                <td>{repo.private ? "private" : "public"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <footer>
        green &lt;48h · amber &lt;14d · red stale — set GITHUB_TOKEN to include
        private repos and raise rate limits
      </footer>
    </main>
  );
}
