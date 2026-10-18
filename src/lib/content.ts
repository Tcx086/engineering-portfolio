export const site = {
  name: 'Tom Chen',
  title: 'Backend, Data & Market Systems Engineering',
  description: 'Building reliable data infrastructure, backend services, and AI-integrated systems.',
  url: 'https://portfolio.tcx086.com',
  email: 'tom863631@gmail.com',
  github: 'https://github.com/Tcx086'
};

export type Section = { title: string; paragraphs: string[]; points?: string[] };
export type Project = {
  slug: string; number: string; name: string; category: string; summary: string;
  tags: string[]; role: string; diagram?: 'capture' | 'context';
  sections: Section[]; link?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    slug: 'microstructure-discovery-factory', number: '01', name: 'Microstructure Discovery Factory',
    category: 'Independent research & engineering',
    summary: 'A market data platform built around a harder question: can the captured data actually be trusted for research?',
    role: 'Independent project · Market data acquisition, persistence, validation and replay',
    tags: ['Python', 'TypeScript', 'WebSocket', 'Parquet', 'DuckDB', 'Linux'], diagram: 'capture',
    sections: [
      { title: 'The engineering problem', paragraphs: [
        'A live socket is only the beginning of a useful dataset. Exchange streams can disconnect, order books can lose continuity, and a process can report success before all of its data reaches durable storage.',
        'Microstructure Discovery Factory is an independent research and engineering platform for acquiring multi-exchange market data and preserving the evidence needed to evaluate it. The work spans Level-2 order books, trades, persistence, recovery and research replay.'
      ] },
      { title: 'From acquisition to research', paragraphs: [
        'Venue-specific acquisition handles stream semantics before data enters a shared persistence and validation path. Order-book trust is tracked separately from connection state. After a disconnect, recovery requires a fresh snapshot and a valid continuation of updates.',
        'Durable spooling and Parquet persistence separate receipt from confirmed storage. Validation and reconciliation check the resulting artifacts before research consumes them. Python and DuckDB support inspection and replay without making the research process another factual writer.'
      ], points: ['Preserve source identity and acquisition provenance.', 'Distinguish event time, receipt and durable availability.', 'Retain interruptions and recovery boundaries in replay.', 'Monitor source progress, queues, persistence and terminal outcomes separately.'] },
      { title: 'Evidence from one FOMC capture', paragraphs: [
        'The documented event capture covered 12 of 12 capture lanes, with 653,722 Level-2 updates and 4,339,527 trades. Event analysis observed approximately 68% contraction in displayed BTC/ETH depth.',
        'These figures describe that specific event capture. They are not an uptime claim, a statement about every dataset, or evidence that subsequent 24-hour collection campaigns passed. Displayed depth is an order-book observation, not executed liquidity or a trading return.'
      ] },
      { title: 'Failure analysis shaped the design', paragraphs: [
        'A burst investigation reproduced event-loop starvation in a queue that repeatedly removed the first element of an array. The remediation used ring storage and bounded cooperative draining, preserving FIFO order and existing persistence semantics.',
        'A separate source-continuity contract invalidates order-book trust immediately on disconnection. Reconnection creates a new recovery cycle; a socket opening by itself does not restore data completeness. Operational checks also look for stalled book progress and premature termination.'
      ] },
      { title: 'Verification and boundaries', paragraphs: [
        'Reviewed evidence includes implementation documentation, focused queue regression reports and source-continuity contracts. Focused verification supports those specific behaviors; it does not certify the entire platform or an arbitrary collection run.',
        'The source repository and market datasets are private. This case study publishes a high-level engineering account and approved event figures. Source code, raw market data, operational topology and deployment details are withheld.'
      ] }
    ]
  },
  {
    slug: 'market-context-engine', number: '02', name: 'Situation Monitor',
    category: 'Independent research & product',
    summary: 'Market and macroeconomic context with source provenance, temporal guards and explicit uncertainty.',
    role: 'Independent project · Backend integrations, structured processing and data integrity',
    tags: ['TypeScript', 'Python', 'Cloudflare Workers', 'D1', 'SvelteKit'], diagram: 'context',
    link: { label: 'Visit Situation Monitor', href: 'https://news-monitor.tcx086.com/' },
    sections: [
      { title: 'Context needs a time boundary', paragraphs: [
        'Situation Monitor is the frontend of Market Context Engine, an independent project that brings together news, macroeconomic information and market context. Its engineering challenge is to keep a useful explanation attached to its sources and to what was knowable at a particular time.',
        'A headline publication time is not necessarily the time the system received or persisted it. Historical research must not silently import information that became available later.'
      ] },
      { title: 'Processing and persistence', paragraphs: [
        'The SvelteKit frontend presents market context. Cloudflare Workers integrate external APIs and selected news sources, while D1 supports trusted event history. Normalization, validation and source provenance sit between acquisition and interpretation.',
        'The documented research path separates source publication, first receipt and durable snapshot availability. As-of selection requires the appropriate receipt. Immutable snapshots and explicit evidence identities make later inspection and replay possible.'
      ], points: ['Validate event identities and leave incomplete matches unresolved.', 'Freeze pre-event evidence instead of rewriting expectations after release.', 'Keep observed facts separate from heuristic narrative interpretation.', 'Make stale, missing and partial source coverage visible.'] },
      { title: 'Verification evidence', paragraphs: [
        'Reviewed architecture and verification reports describe checks for delayed commits, restart persistence, immutable snapshots, historical as-of boundaries and read-only retrieval. The important property is that a later receipt cannot make a snapshot appear available in an earlier historical query.',
        'These are focused, documented checks. This portfolio does not present them as comprehensive production certification. Historical record counts and a previously cited parity-suite total are omitted because their dated scope was not established in the reviewed material.'
      ] },
      { title: 'What the product does not establish', paragraphs: [
        'Coverage depends on the selected sources and provider availability. Some interpretation uses rules and uncalibrated weights; it is not a calibrated forecast. A successful API response does not prove every displayed panel is live or that all event families have complete evidence.',
        'The public dashboard is available below. This case study makes no claim of institutional use, trading performance or a completed integration with the separate market-data research platform.'
      ] }
    ]
  },
  {
    slug: 'lomidance', number: '03', name: 'Lomidance',
    category: 'Part-time contract engineering',
    summary: 'Collaborative backend engineering for an AI-integrated product, with explicit API contracts and validation.',
    role: 'Part-time contract contributor · Collaborative commercial work',
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'SQLAlchemy', 'Alembic', 'REST APIs'],
    sections: [
      { title: 'A collaborative engineering role', paragraphs: [
        'Lomidance is part-time contract engineering work on a collaborative product. My contribution focuses on backend services, database models, API contracts and external AI generation API integration.',
        'The work belongs in a different category from my independent research projects: interfaces and changes must fit a shared codebase and respect collaborator ownership.'
      ] },
      { title: 'Contribution areas', paragraphs: [
        'The approved technology summary includes Python, FastAPI, PostgreSQL, SQLAlchemy and Alembic. Work covers REST API behavior, model and schema changes, integration validation, tests, Git collaboration and deployment workflows.',
        'External generation APIs create a boundary between a product request and a provider response. Validation and clear contracts are important at that boundary, particularly when frontend and backend contributors work in parallel.'
      ] },
      { title: 'Evidence and disclosure boundary', paragraphs: [
        'This summary is limited to the role and contribution areas approved for public disclosure. Local project documentation and dependency manifests were reviewed to corroborate the technology summary.',
        'Private code, proprietary architecture, provider configuration and internal test reports are not reproduced. No independent ownership of the complete product, production scale, live provider verification or commercial performance is claimed.'
      ] }
    ]
  },
  {
    slug: 'portfolio-optimization', number: '04', name: 'Quantitative Portfolio Optimization',
    category: 'Independent research',
    summary: 'Exploring portfolio construction through assumptions, constraints and robustness rather than a single backtest.',
    role: 'Independent research · Portfolio construction and risk evaluation',
    tags: ['Python', 'Optimization', 'Risk analysis', 'Monte Carlo'],
    sections: [
      { title: 'Research question', paragraphs: [
        'How sensitive is a portfolio allocation to the assumptions used to build it? This independent research focuses on comparing portfolio construction methods and evaluating their behavior under uncertainty.',
        'The methodological scope includes Markowitz mean-variance optimization, Black-Litterman, Risk Parity and Conditional Value at Risk (CVaR). Monte Carlo simulation and scenario analysis provide ways to examine robustness.'
      ] },
      { title: 'Methods and tradeoffs', paragraphs: [
        'Mean-variance optimization makes expected returns and covariance estimates central to allocation. Black-Litterman provides a way to combine a prior with explicit views. Risk Parity shifts attention toward risk contributions, while CVaR focuses on the loss tail.',
        'The useful comparison is not just which method produces the best retrospective chart. It also asks how weights respond to estimation error, how constraints affect concentration, and which assumptions dominate adverse scenarios.'
      ] },
      { title: 'Evidence boundary', paragraphs: [
        'This is a concise account of the approved research scope. No reproducible comparison artifact or independently reviewed results table is published with this portfolio, so no method ranking, measured advantage or performance statistic is asserted.',
        'The work is independent research. It does not represent institutional capital management, audited returns or production alpha.'
      ] }
    ]
  }
];

export type Note = { slug: string; number: string; title: string; category: string; summary: string; sections: Section[] };
export const notes: Note[] = [
  {
    slug: 'dedicated-linux-market-data-collector', number: '01',
    title: 'Building a Dedicated Linux Market Data Collector', category: 'Systems reliability · 6 min read',
    summary: 'Process ownership, durable shutdown and the boundary between implementation evidence and hardware acceptance.',
    sections: [
      { title: 'The original problem: shutdown is part of correctness', paragraphs: [
        'A market-data collector has more work to finish than closing its sockets. It must stop acquisition, drain pending output, preserve durable state, wait for persistence and retain a truthful terminal result.',
        'The reviewed Linux preparation report identified a lifecycle defect in the earlier runtime: the stop handler stopped only one acquisition path, and its shared process owner could terminate persistence children while they still had work to finish. Porting that behavior to a service manager would not fix the ordering problem.'
      ] },
      { title: 'Investigation: identify the owner of every child', paragraphs: [
        'The ownership audit followed acquisition workers, the persistent writer, compaction and validation processes. It separated service liveness from dataset acceptance. A parent process exiting successfully cannot establish that its descendants completed their work.',
        'The resulting design keeps a foreground owner under systemd and retains children in the same service cgroup. The research consumer remains separate from the factual writer. This is a conceptual responsibility boundary; no machine addresses, access configuration or operational paths are published here.'
      ] },
      { title: 'Implemented change: stop inputs before durable workers', paragraphs: [
        'The documented stop path first records interruption, then stops acquisition. Paused output is allowed to drain, while persistence workers remain alive for their existing shutdown sequence. An outer deadline bounds how long shutdown can take.',
        'If the deadline forces termination, the outcome remains a failure. Existing spool, markers and worker state must remain available for explicit recovery. A forced stop must never become a successful dataset simply because the service eventually exited.'
      ], points: ['One foreground lifetime owner.', 'Ingestion stops before persistence is torn down.', 'Child exit status and validation results both matter.', 'Recovery preserves the original run identity and evidence.'] },
      { title: 'Verification: state the environment that was tested', paragraphs: [
        'The reviewed preparation report records focused software checks for signal handling, descendant cleanup, unexpected exits, restart constraints and failure propagation. It explicitly labels synthetic-process checks and mocked system-manager observations.',
        'That evidence supports the implemented lifecycle contract in its tested environment. It does not establish physical-host cgroup cleanup, power-loss recovery, storage permissions, clock discipline or a successful long collection campaign. Those require separate host evidence.'
      ] },
      { title: 'Remaining limitations and the practical lesson', paragraphs: [
        'This note reflects the reviewed preparation snapshot, not a current hardware acceptance report. Later deployment activity cannot be inferred from that snapshot. No uptime guarantee or blanket 24-hour collection success is claimed.',
        'The general lesson is to define a collector’s end condition as carefully as its start condition. Service management should preserve the data-integrity contract through interruption, not replace it with a process-health indicator.'
      ] },
      { title: 'Evidence basis', paragraphs: ['Based on the private project’s Linux lifecycle preparation report and deployment documentation, plus the approved public project brief. This article is an original, sanitized engineering summary; private source and operational artifacts are not included.'] }
    ]
  },
  {
    slug: 'websocket-reconnection-data-completeness', number: '02',
    title: 'Why WebSocket Reconnection Does Not Guarantee Data Completeness', category: 'Market data engineering · 5 min read',
    summary: 'Transport recovery, order-book trust and persistence are different conditions. Monitor each one.',
    sections: [
      { title: 'The failure: a healthy socket can carry an incomplete story', paragraphs: [
        'An exchange connection can reopen after an interruption while the local order book still lacks the updates missed during the gap. A connection-health indicator answers whether transport is open. It does not answer whether a reconstructed book is valid.',
        'Market-data failure investigation therefore needs more than reconnect counters. It must examine source progress, reconstruction state, event handling and durable persistence. This note combines a documented source-continuity contract with a separate reproduced queue failure; it does not claim both explain every historical interruption.'
      ] },
      { title: 'Investigation: distinguish silence from local delay', paragraphs: [
        'A venue may stop sending relevant updates. A local event loop may also delay callbacks even while the underlying connection remains open. Both can look like a source going quiet unless the diagnostics distinguish the stages.',
        'In a documented burst investigation, repeated removal from the front of an array reproduced a long synchronous drain. That blocked opportunities for socket and timer callbacks. The report identified it as a root contributor, without attributing every millisecond of the historical event stall to that one function.'
      ] },
      { title: 'Implemented changes', paragraphs: [
        'The queue remediation uses ring storage and bounded cooperative draining. Consumed references are released, FIFO is retained, and yielding gives the event loop another opportunity to service I/O. This improves the reproduced queue behavior without changing factual timestamps or claiming a hard real-time guarantee.',
        'Separately, the documented order-book continuity path invalidates trust on disconnect, retires the old socket and starts a new recovery cycle. Depending on the venue, recovery obtains a new REST or socket snapshot before accepting a valid continuation. Messages from retired connections cannot restore trust.'
      ] },
      { title: 'Verification: connection, continuity and landing', paragraphs: [
        'The queue report compares preserved pre-fix and revised implementations with a deterministic backlog. Its checks cover input/output counts, FIFO, duplicates and callback opportunities. Persistence is represented by an I/O yield in that focused benchmark, so the result is not end-to-end Parquet throughput.',
        'The source-continuity contract also checks actual book progress, time spent trusted or untrusted, fresh data near orderly shutdown and the requested acquisition duration. Repeated socket opens alone do not satisfy the freshness condition.'
      ], points: ['Transport: is the connection open?', 'Continuity: is the reconstructed state valid?', 'Progress: are relevant source frames arriving?', 'Durability: has accepted data reached confirmed storage?', 'Coverage: did every required lane satisfy the run contract?'] },
      { title: 'Remaining limitations', paragraphs: [
        'A fresh snapshot can establish a new valid starting point, but it does not recreate the missing interval. Replay must retain the interruption instead of presenting a continuous history.',
        'Focused regression checks support specific code paths. They cannot prove the absence of every future source outage, scheduling delay or persistence failure. Data completeness remains a property to verify for each run and lane.'
      ] },
      { title: 'Evidence basis', paragraphs: ['Based on the private project’s operational Level-2 source-continuity documentation and September 2026 temporal-burst investigation. No raw market data, private source code, network endpoints or operational configuration is reproduced.'] }
    ]
  }
];

export const pageMeta: Record<string, { title: string; description: string }> = {
  '/': { title: site.title, description: site.description },
  '/projects/': { title: 'Selected engineering projects', description: 'Case studies in market data infrastructure, backend services and research systems.' },
  '/notes/': { title: 'Engineering notes', description: 'Technical notes on collector reliability, WebSocket continuity and evidence-driven failure investigation.' },
  '/about/': { title: 'About Tom', description: 'Tom Chen: engineering focus, University of Toronto education and professional experience.' },
  '/resume/': { title: 'Resume', description: 'A concise public resume for Tom Chen, focused on backend, data and market systems engineering.' },
  '/contact/': { title: 'Get in touch', description: 'Contact Tom Chen about backend, data, market systems and AI integration engineering roles.' }
};
for (const project of projects) pageMeta[`/projects/${project.slug}/`] = { title: project.name, description: project.summary };
for (const note of notes) pageMeta[`/notes/${note.slug}/`] = { title: note.title, description: note.summary };
