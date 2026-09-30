import { z } from 'zod';
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const name = z
  .string()
  .trim()
  .min(1, '이름을 입력해 주세요.')
  .max(30, '이름은 30자 이내로 입력해 주세요.');
const message = z
  .string()
  .trim()
  .min(1, '메시지를 입력해 주세요.')
  .max(1000, '메시지는 1,000자 이내로 입력해 주세요.');
const password = z
  .string()
  .min(4, '비밀번호는 4자 이상 입력해 주세요.')
  .max(128, '비밀번호는 128자 이내로 입력해 주세요.');
export const createInput = z.object({ name, message, password });
export const editInput = z.object({ message, password });
export const deleteInput = z.object({ password });
export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new AppError(400, result.error.issues[0].message);
  return result.data;
}
export function validateId(id: string) {
  if (!z.uuid().safeParse(id).success)
    throw new AppError(404, '글을 찾을 수 없습니다. 이미 삭제되었을 수 있어요.');
}
