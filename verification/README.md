# The floor

**Do not change anything in this directory, in `fixtures/`, or in `.github/workflows/`.**

## What it asserts

`floor.test.ts` and `tool.floor.test.ts` are a **contract gate, not a correctness check**.
Between them they assert that:

- your service answers every example order in the agreed shape — a `discountTotal`, a list
  of `discounts`, each with an `amount` and a `reason` — and that bad input gets a 4xx
  rather than a crash;
- your tool declares at least one argument, and answers every call it is given rather
  than throwing an exception the caller has no way to catch.

They deliberately assert **nothing** about the discounts you calculate. The rules are open
to interpretation in places, and how you read them is your decision to make and yours to
explain. Nor do they check the *format* of what you return — only that the keys are there.
How you represent money is yours to choose and yours to justify.

Clearing this gate is not a good score; it is the price of entry.

**One check fails on a fresh clone**: `declares at least one argument`. A tool with no
arguments cannot be told which order to price, so that one is a task rather than a break.
Everything else is green before you have written a line, which is how you know your
toolchain works.

## What it shows you

`npm run report` prints what your service returns for each example order, and then invokes
your tool the way a model does — badly: nothing at all, arguments as a JSON string, a
hallucinated product id, values of the wrong primitive type, a customer that does not
exist, an argument you never declared.

It asserts nothing and cannot fail. It is worth reading anyway: it is the only view you get
of what a caller sees when it gets something wrong, and whether that caller could tell what
to do differently. The calls use the argument names *your* schema declares, because a real
caller has your schema in front of it.

It also runs in CI, so the result is visible on the workflow run summary.

## Submitting

Your submission includes the output of:

```
npm run verify:integrity
```

It compares the three protected paths against this repo's **first commit** — the one we
handed over — so it keeps working however you obtained the repo and whatever you commit on
top of it. If it prints a diff, you changed the floor, and we will read the submission as
not having passed it.

It runs in CI too, as its own step, so a slip shows up on the run summary when you push
rather than at review time.
