# Coding test — Node.js

We'd like to see how you build things, so here is a small exercise: one problem, and a repo with
the boring parts already done.

A word on what happens to it. What you send us is the start of a conversation rather than a score.
We read it, and then we ask you to walk us through it — and the walkthrough is where it counts. So
aim for something you can defend end to end, not something large.

---

## Before you start

### Getting the repo

Click **Use this template** at the top of this repo and work in the repo that gives you. If you'd
rather, clone it and push to a new repo of your own — same result.

Please don't fork it. Two reasons, both practical: GitHub disables Actions on forks by default, so
the CI run we read never happens, and forks are listed publicly on the repo they came from, which
would put your work in front of every other candidate.

### Running it

Node 24 (there's an `.nvmrc`) and npm.

```
npm install
npm run verify   # lint, types, tests
npm run dev      # the server, on :3000
npm run report   # what your service and your tool actually return
```

**One check is red on a fresh clone**: `declares at least one argument`. That one is a task rather
than a break — a tool with no arguments can't be told which order to price. Everything else is
green before you've written a line, which is how you know your toolchain works.

### The gate

`npm run verify` is the bar, and passing it is the price of entry rather than a good score. It
runs lint, types and tests, including the published floor in `verification/`.

The floor checks that your service answers in the agreed shape and that bad input doesn't crash it.
It deliberately checks nothing about the discounts you calculate, or about how you represent money.
Those are yours to decide and yours to explain.

**`fixtures/`, `verification/` and `.github/workflows/` are ours — please don't edit them.** They
are the floor, and we check them on submission. If a floor test fails, the code under `src/` is
what changes.

### What's already here

A working Fastify skeleton with the discount service stubbed out. Dependencies flow one way:

```
routes/  tools/   ->   plugins/app/   ->   plugins/external/
```

`routes/` and `tools/` are peers — two doors into the same service, not into each other — so
neither imports the other. Files prefixed with `_` are private to their own module. `npm run lint`
enforces both, and the messages say which rule you hit and why.

This is the boundary our own service uses. It's a starting point, not a constraint: change it if
you can tell us why.

### Agents

You're welcome to use coding agents. We don't ask for anything about it — no config, no transcript,
no note, nothing to declare. It comes up once, in the walkthrough, and the question there is about
your code rather than about your tooling.

`AGENTS.md` in the root is a working aid for your agent: which paths not to touch, what the gate is,
what the report does. We don't read it and we don't grade it, so edit or delete it as suits you.

### Scope

This exercise is deliberately small, and the cap is there for fairness more than for our
convenience: it shouldn't be won by whoever has the most free weekend.

We'll ask you to walk us through your submission in about 30 minutes, and anything you can't
explain in that conversation counts against you rather than for you. Extra scope you weren't asked
for reads as a liability rather than as initiative.

---

## The problem: discounts

We need you to build us a small service that calculates discounts for orders.

### How discounts work

For now, there are three possible ways of getting a discount:

- A customer who has already bought for over € 1000, gets a discount of 10% on the whole order.
- For every product of category "Switches" (id 2), when you buy five, you get a sixth for free.
- If you buy two or more products of category "Tools" (id 1), you get a 20% discount on the
  cheapest product.

By the way: there may become more ways of granting customers discounts in the future.

### The data

`fixtures/` holds everything the service has to work with:

- `fixtures/customers.json` and `fixtures/products.json` — customer and product data. Assume these
  arrive in the format of the real external API, because they do.
- `fixtures/orders/` — example orders. These are the payloads we will send you.

### What we ask you to build

Four things, and only these four.

1. **The three discount rules, with tests.** We should be able to see that the rules are right
   without starting the server.
2. **`POST /discounts`.** It takes one of the example orders as its body and returns the discounts
   that apply, each with a reason a human can act on. The response must carry a `discountTotal`
   and a `discounts` array whose entries each have an `amount` and a `reason`. The shape of the
   values — including how you represent money — is yours.
3. **The same logic reachable as a tool call.** `src/tools/calculateDiscount.ts` is stubbed for
   you, against the descriptor our assistant's tool runtime expects. There is no new logic to
   write here — it reaches the same service the endpoint reaches. What it does need is writing:
   see *Who is calling* below.
4. **A short README.** `README.md` is a placeholder — replace it with yours: how to run it, how you
   structured it, and any assumptions you made along the way.

Those four are the whole scope. We are not looking for more.

### Who is calling

The tool call is reached by an assistant rather than by your own code, and there are four things
worth knowing about it. No LLM experience is expected: every one of them is a backend concern.

- **It cannot read your repo.** The tool's `description`, and the `description` on every property
  of its input schema, is the whole of its documentation. Anything you leave ambiguous, it guesses.
- **It cannot catch an exception.** A failure has to come back as a value it can act on — that is
  what the `ToolResult` shape in the stub is for. Useful means it can tell what to do differently.
- **Everything you return costs it something**, on every later turn of the conversation. Return
  the fields needed to answer the question, not everything you happen to have.
- **It cannot be trusted with arithmetic.** Where the answer is a total, compute it and return it
  as a field rather than leaving a sum for the caller to work out.

And one that is about the human at the far end rather than the caller: a reason that says
`category 2` sends the assistant, and then the user, off to work out what that means. What it
takes to say `Switches` instead is already in `fixtures/`.

`npm run report` invokes your tool the way a caller does when it gets things wrong, and prints
what came back. It asserts nothing and cannot fail. Read it: it is the only view you get of what
the caller sees.

### What we look at

Not a checklist of techniques — these are outcomes, and there is more than one good way to reach
each of them.

- **Adding a fourth rule is cheap.** Someone should be able to add one without reading the other
  three first.
- **Bad input fails in a way the caller can act on.** Not a stack trace, not a 500.
- **The two callers share one implementation.** The HTTP endpoint and the tool call are two doors
  into the same room.
- **We can follow your commits.** Small and self-contained, so your reasoning is legible after the
  fact.
- **A stranger can run it.** Your README is the only support you get.

---

## When you're done

### Submitting

Send us a link to the repository — public or private, whichever you prefer, as long as we can get
to it. If you keep it private, add the GitHub account your recruiter gave you as a collaborator.

Include the output of:

```
npm run verify:integrity
```

It compares `fixtures/`, `verification/` and `.github/workflows/` against this repo's first commit —
the one we handed over — so it works however you got the repo and whatever you commit on top. If it
prints a diff, we'll read the submission as not having passed the floor. It runs in CI too, so a
slip shows up when you push rather than at review time.

### Questions

If something about the setup or the tooling isn't clear, ask — we'd rather you weren't stuck on our
scaffolding.

We won't answer questions about how to read the discount rules, though. That reading is yours to
make and yours to explain.
