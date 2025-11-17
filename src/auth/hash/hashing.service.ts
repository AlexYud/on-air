export abstract class HashingServiceProtocol {
  abstract hashPassword(password: string): Promise<string>;
  abstract comparePasswords(password: string, hashedPassword: string): Promise<boolean>;
}