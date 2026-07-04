# Contributing to GhostRelay

Thanks for your interest in contributing! GhostRelay is a privacy-focused email
aliasing service built on Cloudflare's free tier. Contributions of all kinds are
welcome — bug reports, feature requests, documentation, and code.

## Getting Started

1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/<your-username>/GhostRelay---Open-Source.git
   cd GhostRelay---Open-Source
   ```
2. Install dependencies:
   ```bash
   npm run install:all
   ```
3. Copy the environment templates and fill in your own values:
   ```bash
   cp frontend/.env.example frontend/.env.local
   cp worker/.env.example worker/.dev.vars   # optional, for local secrets
   ```
4. See [`README.md`](./README.md) and [`CONTEXT.md`](./CONTEXT.md) for the full
   architecture and local setup guide.

## Project Layout

| Path         | Description                                   |
|--------------|-----------------------------------------------|
| `frontend/`  | Next.js 16 app (TypeScript, Tailwind v4)      |
| `worker/`    | Cloudflare Worker backend (ES modules)        |
| `database/`  | D1 SQL schema and migrations                  |
| `extension/` | Browser extension (Chrome/Edge/Firefox)       |
| `docs/`      | Setup guides (SPF/DKIM, advanced features)    |

## Development Workflow

1. Create a feature branch off `main`:
   ```bash
   git checkout -b feature/short-description
   ```
2. Make your changes with clear, focused commits.
3. Run the frontend build and lint before opening a PR:
   ```bash
   cd frontend && npm run build && npm run lint
   ```
4. Push your branch and open a pull request against `main`.

## Pull Request Guidelines

- Keep PRs focused on a single change where possible.
- Describe what changed, why, and how you tested it.
- Reference any related issues (e.g. `Closes #12`).
- Do not commit secrets. `.env`, `.env.local`, and `.dev.vars` are gitignored —
  keep it that way. Use `.env.example` to document new variables instead.

## Reporting Security Issues

Please do not open public issues for security vulnerabilities. Instead, email the
maintainer or use GitHub's private security advisory feature so the issue can be
addressed before disclosure.

## Code of Conduct

Be respectful and constructive. We want GhostRelay to be a welcoming project for
contributors of all backgrounds and experience levels.

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](./LICENSE).
