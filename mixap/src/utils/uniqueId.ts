import { nanoid } from 'nanoid';
import { customAlphabet } from 'nanoid';

const cnanoid = customAlphabet('1234567890abcdef', 6);

export const getID = (prefix = 'u', length?: number) =>
  length ? prefix + nanoid(length) : prefix + nanoid();

export const getCode = () => cnanoid();
