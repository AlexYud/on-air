import { HashingServiceProtocol } from "./hashing.service";
import * as bcrypt from 'bcryptjs';

export class BcryptService extends HashingServiceProtocol {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}