// The battery: the calls a model actually gets wrong. One battery, two readers —
// `tool.floor.test.ts` asserts only that none of them blow up, and `report.ts`
// prints what came back so a human can judge whether the caller could have
// recovered.
//
// The names below are placeholders. A real caller has your `inputSchema` in
// front of it, so it uses *your* names — `callsFor` rewrites each argument to
// whatever you called it before the call goes out. An argument you never
// declared keeps its name, because that is the case.

export interface BadCall {
  label: string;
  why: string;
  args: unknown;
  /** Send every value as the primitive type this tool did *not* declare. */
  flipTypes?: boolean;
}

type Schema = { type?: string; properties?: Record<string, unknown>; items?: unknown };

const anOrder = {
  customerId: '2',
  items: [
    { productId: 'B102', quantity: '11' },
    { productId: 'A101', quantity: '2' },
  ],
};

const battery: BadCall[] = [
  {
    label: 'nothing at all',
    why: 'It read your description and still does not know what to send.',
    args: {},
  },
  {
    label: 'the arguments as a JSON string',
    why: 'Models stringify their arguments more often than you would like.',
    args: JSON.stringify(anOrder),
  },
  {
    label: 'a product that does not exist',
    why: 'A hallucinated id. Does the answer name it?',
    args: { customerId: '1', items: [{ productId: 'B999', quantity: '3' }] },
  },
  {
    label: 'every value as the other primitive type',
    why: 'A caller reads your schema and still sends "10" where you asked for 10, or the reverse.',
    args: { customerId: '1', items: [{ productId: 'B102', quantity: 10 }] },
    flipTypes: true,
  },
  {
    label: 'a customer that does not exist',
    why: 'Fatal, or simply no loyalty discount? Either is defensible; you have to have decided.',
    args: { customerId: '99', items: [{ productId: 'B102', quantity: '6' }] },
  },
  {
    label: 'an argument you never declared',
    why: 'Callers add fields. Strict validation rejects them; lenient validation ignores them.',
    args: { ...anOrder, currency: 'EUR' },
  },
];

const normalise = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

function flip(value: unknown, declared: string | undefined): unknown {
  // Only where the other type is a value a caller could plausibly send: a
  // product id is not a number in any reading.
  if (declared === 'string') {
    const asNumber = Number(value);

    return Number.isNaN(asNumber) ? value : asNumber;
  }

  if (declared === 'number' || declared === 'integer') {
    return String(value);
  }

  return value;
}

/** Rewrites our placeholder argument names to the ones this tool declares. */
function rename(value: unknown, schema: Schema | undefined, flipTypes = false): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => rename(entry, schema?.items as Schema | undefined, flipTypes));
  }

  if (value === null || typeof value !== 'object') {
    return flipTypes ? flip(value, schema?.type) : value;
  }

  const declared = new Map(Object.keys(schema?.properties ?? {}).map((key) => [normalise(key), key]));

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      const theirs = declared.get(normalise(key)) ?? key;

      return [theirs, rename(entry, schema?.properties?.[theirs] as Schema | undefined, flipTypes)];
    }),
  );
}

export function callsFor(tool: { inputSchema?: unknown }): BadCall[] {
  const schema = tool.inputSchema as Schema | undefined;

  return battery.map((call) => ({ ...call, args: rename(call.args, schema, call.flipTypes) }));
}
