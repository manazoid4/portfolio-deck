import { getRepos, recency, type Repo } from "@/lib/github";
import { PROJECTS, type PortfolioProject } from "@/lib/portfolio-data";

export const revalidate = 300;

function Dot({ tone }: { tone: string }) {
  return <span className={`dot ${tone}`} />;
}

function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <div className="pin">
      <h2>{project.title}</h2>
      <p className="desc">{project.description}</p>
      <div className="row">
        <span className="k">TECH</span>
        <span className="tech">{project.techStack.join(" · ")}</span>
      </div>
      <div className="row">
        <span className="k">STATUS</span>
        <span>
          <Dot tone={project.status === "Live" ? "ok" : "warn"} />
          {project.status}
        </span>
      </div>
      <div className="row cta-row">
        <a
          className="cli-btn"
          href={project.link}
          target="_blank"
          rel="noreferrer"
        >
          [ VIEW PROJECT ]
        </a>
      </div>
    </div>
  );
}

export default async function Page() {
  let repos: Repo[] = [];
  try {
    repos = await getRepos();
  } catch {
    // Public page should render even if GitHub is unreachable or rate-limited.
  }
  const recent = repos
    .filter((r) => !r.private)
    .sort(
      (a, b) =>
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    )
    .slice(0, 10);

  return (
    <main>
      <section className="hero">
        <p className="prompt">manazoid4@public:~$ whoami</p>
        <h1>Manazir Hussain</h1>
        <div className="hero-meta">
          <p>
            <span className="k">USER:</span> Manazir Hussain (@manazoid4)
          </p>
          <p>
            <span className="k">ROLE:</span> System Architect, Founder, AI
            Engineer
          </p>
          <p>
            <span className="k">STATUS:</span>{" "}
            <span className="executing">Executing…</span>
          </p>
        </div>
        <p className="hero-copy">
          I build and ship AI-native products — workflow intelligence,
          recruitment engines, and local agent environments. Everything below
          is real, running software.
        </p>
      </section>

      <section>
        <h2 className="section-title">[ FEATURED_PROJECTS ]</h2>
        <div className="pins">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">[ LIVE_ACTIVITY_LOG ]</h2>
        {recent.length === 0 ? (
          <p className="log-empty">activity feed offline — check back soon</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>repo</th>
                <th>last push</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((repo) => {
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <footer className="contact">
        <p className="prompt">root@mazos:~# ./contact.sh</p>
        <div className="contact-links">
          <a className="cli-btn" href="mailto:manazoid4@gmail.com">
            [ EMAIL ]
          </a>
          <a className="cli-btn" href="#">
            [ LINKEDIN ]
          </a>
          <a className="cli-btn" href="#">
            [ TELEGRAM ]
          </a>
        </div>
      </footer>
    </main>
  );
}
