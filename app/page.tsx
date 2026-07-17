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
          <span className="k">LAST PUSH</span>
          <span>
            <Dot tone={r.tone} />
            {r.label}
          </span>
        </div>
        <div className="row">
          <span className="k">OPEN PRS</span>
          <span className={`prbadge ${prs === 0 ? "zero" : ""}`}>{prs}</span>
        </div>
        <div className="row">
          <span className="k">DEPLOY</span>
          <span>
            <Dot tone={deployTone(deploy.state)} />
            {deploy.state ?? "NONE"}
            {deploy.environment ? ` [${deploy.environment.toUpperCase()}]` : ""}
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

  const generatedAt = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";

  return (
    <main>
      <header className="deck">
        <h1>[ MAZOS_PORTFOLIO_DECK ]</h1>
        <span className="stamp">
          {repos.length} REPOS · {generatedAt}
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

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>REPO</th>
              <th>LAST PUSH</th>
              <th className="num">OPEN PRS</th>
              <th>VISIBILITY</th>
            </tr>
          </thead>
          <tbody>
            {rest.map((repo) => {
              const r = recency(repo.pushed_at);
              const prs = prCounts.get(repo.name) ?? 0;
              return (
                <tr key={repo.name}>
                  <td>
                    <a href={repo.html_url} target="_blank" rel="noreferrer">
                      {repo.name}
                    </a>
                  </td>
                  <td>
                    <Dot tone={r.tone} />
                    {r.label.toUpperCase()}
                  </td>
                  <td className={`num prbadge ${prs === 0 ? "zero" : ""}`}>
                    {prs}
                  </td>
                  <td className="visibility">{repo.private ? "PRIVATE" : "PUBLIC"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer>
        &gt;&gt; SYS_READY. GREEN &lt;48H | AMBER &lt;14D | RED STALE. <br />
        &gt;&gt; SET GITHUB_TOKEN TO INCLUDE PRIVATE REPOS &amp; RAISE RATE LIMITS.
      </footer>
    </main>
  );
}
