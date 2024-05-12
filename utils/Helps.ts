import { generate as generateIdentifier } from 'short-uuid';

export function generateUniqueId(): string {
  return generateIdentifier();
}
