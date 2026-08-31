// The shape our assistant's tool runtime expects a tool to have.
//
// This is a trimmed version of the real descriptor in the service this test
// mirrors: the fields that carry meaning for a tool like this one, and none of
// the machinery that doesn't. You should not need to change anything in here.
//
// Deliberately absent: authorization. The real descriptor carries a
// `capabilities` field, and the real `calculate` tool — the closest sibling to
// what you are building — leaves it empty. A tool that computes an answer and
// stores nothing has nothing to authorize.

/**
 * What `execute` gives back. The caller cannot catch a thrown error, so failure
 * is a returned value rather than an exception.
 */
export type ToolResult =
  | ({ success: true } & Record<string, unknown>)
  | { success: false; error: { title: string } };

export interface ToolDescriptor {
  /** Tool name, as the assistant refers to it. */
  name: string;

  /**
   * `background` tools the assistant runs on its own, whenever it judges them
   * useful. `write` tools change a record, so the user is shown a preview and
   * has to approve before `execute` runs.
   */
  category: 'background' | 'write';

  /** Required for `write` tools, meaningless for `background` ones. */
  needsApproval?: boolean;

  /**
   * Written for the caller, not for us. It cannot read this repo, so anything it
   * needs in order to call you correctly has to be in here.
   */
  description: string;

  /**
   * JSON Schema for the arguments. Every property needs its own `description`,
   * for the same reason the tool does.
   */
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };

  /**
   * Nothing validates these arguments before you get them: the caller assembles
   * them from a conversation and will sometimes get them wrong. `args` is
   * therefore `unknown`, and narrowing it is part of the job.
   */
  execute: (args: unknown) => Promise<ToolResult>;
}
