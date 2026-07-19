export type ProjectStatus = "Live" | "Active Development";

export interface PortfolioProject {
  title: string;
  description: string;
  techStack: string[];
  status: ProjectStatus;
  link: string;
}

export const PROJECTS: PortfolioProject[] = [
  {
    title: "FlowLens",
    description:
      "AI-driven workflow optimization. Captures how work actually happens across a team, surfaces bottlenecks, and generates evidence-backed process improvements.",
    techStack: ["Next.js", "TypeScript", "Supabase", "OpenAI"],
    status: "Live",
    link: "https://github.com/manazoid4/flowlens",
  },
  {
    title: "JobFilter",
    description:
      "Smart recruitment and filtering engine. Scores inbound roles against configurable signal profiles, cutting screening time from hours to minutes.",
    techStack: ["Next.js", "TypeScript", "Postgres", "LLM Pipelines"],
    status: "Live",
    link: "https://github.com/manazoid4",
  },
  {
    title: "MAZos / Hermes",
    description:
      "High-agency local execution AI agent environment. A command cockpit that plans, executes, and verifies multi-step work across repos, shells, and services.",
    techStack: ["Next.js", "TypeScript", "Agent SDK", "MCP"],
    status: "Active Development",
    link: "https://github.com/manazoid4/mazos-ui",
  },
  {
    title: "ForgeOS",
    description:
      "Modular build-automation layer that turns project specs into reproducible pipelines: scaffolding, CI wiring, and deploy targets from a single manifest.",
    techStack: ["TypeScript", "Node.js", "GitHub Actions"],
    status: "Active Development",
    link: "https://github.com/manazoid4",
  },
  {
    title: "InkWeave",
    description:
      "AI snippet-to-book platform. Transforms scattered notes and fragments into structured, publish-ready long-form manuscripts.",
    techStack: ["Next.js", "TypeScript", "LLM Orchestration"],
    status: "Active Development",
    link: "https://github.com/manazoid4/inkweave",
  },
];
