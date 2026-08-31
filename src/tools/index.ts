import { calculateDiscountToolDescriptor } from './calculateDiscount.js';
import type { ToolDescriptor } from './_toolDescriptor.js';

/** Every tool the assistant can reach. */
export const tools: ToolDescriptor[] = [calculateDiscountToolDescriptor];

export type { ToolDescriptor, ToolResult } from './_toolDescriptor.js';
