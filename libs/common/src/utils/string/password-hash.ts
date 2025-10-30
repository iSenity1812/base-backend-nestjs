import * as bcrypt from 'bcryptjs';

export class PasswordHash {
  static hashPassword(plainPassword: string): string {
    const salt = 10;
    return bcrypt.hashSync(plainPassword, salt);
  }

  static comparePassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }
}
