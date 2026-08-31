# AGENTS.md

Notes for a coding agent working in this repo.

This file is a working aid, not a deliverable. We do not read it and we do not grade it, and it
is not pinned — edit it, extend it, or delete it as suits you.

## Do not edit these paths

`fixtures/`, `verification/` and `.github/workflows/` are the published floor.

`npm run verify:integrity` compares them against this repo's first commit — the one that was
handed over — and the submission includes that output. A floor edited to make a check pass is
read as a floor not passed.

**One check is red on a fresh clone**: `declares at least one argument`, in
`verification/tool.floor.test.ts`. That is a task, not a break — a tool with no arguments cannot
be told which order to price. Fix it in `src/tools/`, never in `verification/`.

When a floor test fails, the code under `src/` is what changes.

## The gate

```
npm run verify        # lint + types + tests
```

`lint` enforces an architectural boundary as well as style. Dependencies flow one way only:

```
routes/  tools/   ->   plugins/app/   ->   plugins/external/
```

`routes/` and `tools/` are peers — two doors into the same service, not into each other — so
neither may import the other. Files prefixed with `_` are private to their own module; import the
module's index instead. The lint messages say which rule you hit and why.

## The report

```
npm run report
```

Prints what the service returns for each example order, then invokes the tool the way a model
does when it gets things wrong. It asserts nothing and cannot fail.

It is the only view of what a caller actually sees. Read its output rather than predicting it.
