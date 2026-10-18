export const site = {
  name: 'Tom Chen',
  title: 'Backend, Data & Market Systems Engineering',
  description: 'Tom Chen builds backend services, market data pipelines and AI integrations with Python, TypeScript and SQL.',
  url: 'https://portfolio.tcx086.com',
  email: 'tom863631@gmail.com',
  github: 'https://github.com/Tcx086'
};

export type Section = { title: string; paragraphs: string[]; points?: string[] };
export type Project = {
  slug: string; number: string; name: string; category: string; summary: string;
  tags: string[]; role: string; diagram?: 'capture' | 'context';
  sections: Section[]; result: string; tools: string; technical: Section[];
  limitations: string; link?: { label: string; href: string };
};

export const captureMetrics = [
  { value: '12/12', label: 'capture lanes completed' },
  { value: '653,722', label: 'order-book (L2) updates' },
  { value: '4,339,527', label: 'trades recorded' },
  { value: '~68%', label: 'displayed BTC/ETH depth contraction' }
];

export const projects: Project[] = [
  {
    slug: 'microstructure-discovery-factory', number: '01', name: 'Microstructure Discovery Factory',
    category: 'Independent project',
    summary: 'I built a system that collects live cryptocurrency market data from multiple exchanges, stores it for analysis and checks it for gaps and errors.',
    role: 'Independent Researcher | Market Data & Systems · August 2026 - Present',
    tags: ['Python', 'TypeScript', 'WebSocket', 'Parquet', 'DuckDB', 'Linux'], diagram: 'capture',
    sections: [
      { title: 'Why I built it', paragraphs: ['I wanted to study how markets behave during busy events. That requires a detailed record of trades and orders, along with a way to tell whether anything was missed. A price chart alone cannot answer those questions.'] },
      { title: 'What I implemented', paragraphs: [], points: [
        'Collectors that receive exchange updates and trades over WebSocket connections.',
        'A storage pipeline that saves the data for later analysis and checks what reached disk.',
        'Validation and replay tools to investigate missing updates, recover from interruptions and repeat research.',
        'Monitoring and lifecycle work for a dedicated Alienware Linux collector, separating collection from research workloads.'
      ] },
      { title: 'What the system does', paragraphs: ['The collector records trades and changes to the order book, the list of displayed buy and sell orders. It processes those updates, stores them and checks the resulting dataset before research uses it. Replay lets me revisit an event with the information that was available at the time.'] }
    ],
    result: 'During one documented Federal Reserve policy event (FOMC), the collector recorded the data below. I used it to study how much displayed Bitcoin and Ether buy and sell interest fell around the announcement, and how it recovered.',
    tools: 'TypeScript handles live collection. Python, Parquet and DuckDB support storage checks and analysis. Linux provides a dedicated environment for running the collector.',
    technical: [
      { title: 'Keeping storage and recovery in sync', paragraphs: [
        'The pipeline separates receiving an update from confirming that it has reached durable storage. A spool retains pending data; landing and reconciliation check the stored artifacts before research consumes them.',
        'Source identity and exchange, receipt and availability timestamps travel with the data. Research readers use those time boundaries to avoid including information before it was available.'
      ] },
      { title: 'Handling disconnects and busy periods', paragraphs: [
        'A reopened connection does not repair a missing order-book interval. The continuity path invalidates book trust on disconnect and starts a fresh snapshot/recovery cycle. Replay retains the interruption.',
        'A separate burst investigation reproduced event-loop starvation in a queue that repeatedly removed the first array element. I replaced that behavior with ring storage and bounded cooperative draining while preserving FIFO order and persistence behavior. Focused regression checks covered the reproduced queue failure.'
      ] },
      { title: 'Running collection on dedicated Linux hardware', paragraphs: [
        'The Alienware Linux collector is a practical step from a research workstation toward dedicated collection hardware. The lifecycle work gives acquisition, storage and validation workers a common service owner.',
        'Shutdown stops new inputs before storage workers are torn down. A forced stop retains failure evidence and pending state for explicit recovery. The engineering note explains the implementation checks and the separate physical-host acceptance requirements.'
      ] }
    ],
    limitations: 'The figures describe one event capture, not every collection campaign or a general uptime result. The repository and raw market data remain private. Linux lifecycle software checks and physical-host acceptance are separate pieces of evidence.'
  },
  {
    slug: 'market-context-engine', number: '02', name: 'Situation Monitor', category: 'Independent product & research',
    summary: 'I built a dashboard that organizes financial news, economic events and market information so they can be reviewed together.',
    role: 'Independent Product & Research Project · 2025 - Present',
    tags: ['TypeScript', 'Python', 'SvelteKit', 'Cloudflare Workers', 'D1'], diagram: 'context',
    link: { label: 'Open Situation Monitor', href: 'https://news-monitor.tcx086.com/' },
    sections: [
      { title: 'Why I built it', paragraphs: ['Financial news and economic releases arrive from different sources and at different times. I wanted a place to organize that information, trace it back to its source and review what was known before or after an event.'] },
      { title: 'What I implemented', paragraphs: [], points: [
        'Source collection and API integrations for news, macroeconomic information and market data.',
        'Structured extraction and validation to turn incoming information into records the system can compare and inspect.',
        'A SvelteKit dashboard backed by Cloudflare Workers and D1 event history.',
        'Historical lookups that distinguish when information was published from when the system actually received and saved it.'
      ] },
      { title: 'What the system does', paragraphs: ['Situation Monitor is the public interface of Market Context Engine. Incoming news and event information is organized into source-linked context. Historical inspection lets me ask what information was available at an earlier moment without silently adding later updates.'] }
    ],
    result: 'The public dashboard is available to explore. Documented checks cover saved event history surviving a restart or redeployment, consistent historical selection and read-only inspection. These checks make the product useful as both a market-context tool and a data-engineering project.',
    tools: 'SvelteKit and TypeScript present the dashboard. Cloudflare Workers handle provider requests, D1 stores trusted event history, and Python supports research and validation workflows.',
    technical: [
      { title: 'Turning incoming information into useful records', paragraphs: ['Collection, structured extraction and validation are separate stages. Records retain source identity, while checks handle incomplete fields, duplicate information and inconsistent event identities. Missing or stale source coverage stays visible.'] },
      { title: 'Keeping historical views consistent', paragraphs: [
        'Source publication, first receipt and durable availability are different timestamps. An as-of query uses availability evidence so a late discovery cannot appear in a snapshot from before the system received it.',
        'The documented checks include delayed commits, restart persistence, immutable snapshots and historical boundaries. Pre-event expectations are frozen separately from later results and revisions.'
      ] }
    ],
    limitations: 'Coverage depends on source availability. Some market interpretation uses rules and uncalibrated weights, so it should be read as context rather than a forecast. Historical dataset and test-suite totals are omitted until their dated scope can be established.'
  },
  {
    slug: 'lomidance', number: '03', name: 'Lomidance', category: 'Contract part-time',
    summary: 'I contribute backend services, database models and AI service integrations to a shared product for generative video workflows.',
    role: 'Backend & Data Engineer | Contract Part-time · May 2026 - Present',
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'SQLAlchemy', 'Alembic', 'REST APIs'],
    sections: [
      { title: 'The product and my role', paragraphs: ['Lomidance is a collaborative AI product. I work as a Backend & Data Engineer under a part-time contract arrangement, contributing to a shared codebase with other product and engineering collaborators.'] },
      { title: 'What I contribute', paragraphs: [], points: [
        'Python and FastAPI backend services and REST API contracts.',
        'PostgreSQL models, application data flows and migrations using SQLAlchemy and Alembic.',
        'Integration with external AI generation services, including input validation and failure handling.',
        'Focused tests, backend/frontend coordination and shared Git/GitHub development and deployment workflows.'
      ] },
      { title: 'What the backend supports', paragraphs: ['The backend connects the product interface, stored application data and external generation services. My work helps those parts exchange data through defined API contracts, with validation and tests around the integration points.'] }
    ],
    result: 'My contributions span backend services, database design, API integration and validation in an existing shared application. The work requires coordinating changes with collaborators and fitting them into the product development and deployment workflow.',
    tools: 'Python and FastAPI provide the service layer. PostgreSQL stores application data, SQLAlchemy maps database models, and Alembic manages schema migrations.',
    technical: [{ title: 'Working across application and provider boundaries', paragraphs: ['An application request and an external provider response have different validation and failure cases. Clear API contracts, focused tests and explicit handling of unsuccessful responses help frontend and backend contributors work against the same behavior.'] }],
    limitations: 'This is collaborative contract work. Commercial source code, proprietary architecture and internal operational details remain confidential; the summary describes my contribution areas rather than ownership of the entire product.'
  },
  {
    slug: 'portfolio-optimization', number: '04', name: 'Quantitative Portfolio Optimization', category: 'Independent research',
    summary: 'I compared ways to allocate a portfolio and tested how the results change when market assumptions become less favorable.',
    role: 'Independent Project · 2025 - August 2026',
    tags: ['Python', 'Portfolio allocation', 'Monte Carlo', 'Scenario analysis'],
    sections: [
      { title: 'Why I built it', paragraphs: ['A portfolio allocation can look sensible under one set of assumptions and change sharply under another. I wanted to compare methods and understand how much their results depend on expected returns, risk estimates and constraints.'] },
      { title: 'What I implemented', paragraphs: [], points: [
        'Portfolio comparisons using Markowitz, Black-Litterman, Risk Parity and CVaR methods.',
        'Scenario analysis for changing volatility, correlation, transaction costs and downside risk.',
        'Monte Carlo-style tests and sensitivity analysis to examine how stable the allocations were.'
      ] },
      { title: 'How I used the comparisons', paragraphs: ['I changed the inputs and reviewed how the weights, concentration and risk measures responded. That made it possible to compare each method\'s assumptions and failure modes alongside its historical output.'] }
    ],
    result: 'The project produced implemented comparisons across several allocation approaches and a way to examine their sensitivity to market assumptions. The useful outcome was understanding when an allocation becomes unstable and which inputs drive that behavior.',
    tools: 'Python supports the allocation comparisons, simulation and scenario analysis.',
    technical: [{ title: 'What the allocation methods optimize', paragraphs: [
      'Markowitz balances expected return against variance. Black-Litterman combines a prior with explicit views. Risk Parity focuses on each holding\'s contribution to risk. Conditional Value at Risk (CVaR) examines losses in the tail.',
      'Monte Carlo and scenario analysis test sensitivity to changing estimates and constraints. The comparison also considers volatility, covariance, drawdown and transaction-cost assumptions.'
    ] }],
    limitations: 'This is independent research. Reproducible comparison artifacts are not published here, and the portfolio makes no audited-return, method-ranking or production-alpha claim.'
  }
];

export type Note = { slug: string; number: string; title: string; category: string; summary: string; takeaway: string; sections: Section[] };
export const notes: Note[] = [
  {
    slug: 'dedicated-linux-market-data-collector', number: '01',
    title: 'Building a Dedicated Linux Market Data Collector', category: 'Systems reliability · 6 min read',
    summary: 'Stopping a collector at the wrong moment can interrupt storage or leave background workers running. A dedicated Linux service needs to handle shutdown as carefully as collection.',
    takeaway: 'Stop new inputs first, let storage finish within a deadline, and preserve a failed run for recovery when shutdown cannot complete cleanly.',
    sections: [
      { title: 'The original problem: shutdown is part of correctness', paragraphs: [
        'A market-data collector has more work to finish than closing its sockets. It must stop acquisition, drain pending output, preserve durable state, wait for persistence and retain a truthful terminal result.',
        'The reviewed Linux preparation report identified a lifecycle defect in the earlier runtime: the stop handler stopped only one acquisition path, and its shared process owner could terminate persistence children while they still had work to finish. Porting that behavior to a service manager would not fix the ordering problem. The dedicated Alienware Linux collector is the practical hardware context for this lifecycle work.'
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
        'This note reflects the reviewed preparation snapshot. Physical-host acceptance and later 24-hour or 7-day collection outcomes require their own evidence.',
        'The general lesson is to define a collector’s end condition as carefully as its start condition. Service management should preserve the data-integrity contract through interruption, not replace it with a process-health indicator.'
      ] },
      { title: 'Evidence basis', paragraphs: ['Based on the private project’s Linux lifecycle preparation report and deployment documentation, plus the approved public project brief. This article is an original, sanitized engineering summary; private source and operational artifacts are not included.'] }
    ]
  },
  {
    slug: 'websocket-reconnection-data-completeness', number: '02',
    title: 'Why WebSocket Reconnection Does Not Guarantee Data Completeness', category: 'Market data engineering · 5 min read',
    summary: 'A connection can reopen while the local order book still lacks updates from the interruption. Research can reach the wrong conclusion if that interval is treated as complete.',
    takeaway: 'Track connection health, data continuity and confirmed storage separately. A fresh snapshot starts a valid interval; it does not recreate the gap.',
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
  '/projects/': { title: 'Selected engineering projects', description: 'What Tom Chen built, why he built it and the engineering behind the results.' },
  '/notes/': { title: 'Engineering notes', description: 'Technical notes on collector reliability, WebSocket continuity and evidence-driven failure investigation.' },
  '/about/': { title: 'About Tom', description: 'Tom Chen, University of Toronto Mississauga BCom graduate and contract part-time Backend & Data Engineer at Lomidance.' },
  '/resume/': { title: 'Resume', description: 'A concise public resume for Tom Chen, focused on backend, data and market systems engineering.' },
  '/contact/': { title: 'Get in touch', description: 'Contact Tom Chen about backend, data, market systems and AI integration engineering roles.' }
};
for (const project of projects) pageMeta[`/projects/${project.slug}/`] = { title: project.name, description: project.summary };
for (const note of notes) pageMeta[`/notes/${note.slug}/`] = { title: note.title, description: note.summary };
