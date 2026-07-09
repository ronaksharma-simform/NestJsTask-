import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
@Injectable()
export class HashService {
  private saltOrRounds = 10;
  async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, this.saltOrRounds);
    return hash;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
