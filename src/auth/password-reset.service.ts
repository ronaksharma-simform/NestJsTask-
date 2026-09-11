import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { HashService } from '../utils/hash.services';
import { UserDTO } from './dto/user.dto';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(UserDTO) private readonly userRepository: Repository<UserDTO>,
    private readonly hashService: HashService,
  ) {}

  /**
   * Issues a one-time reset token for the account owning `email`.
   *
   * Only the SHA-256 hash of the token is persisted (never the raw token), and
   * the raw token is returned to the caller once. In a production deployment
   * the raw token would be emailed instead of returned; this API returns it so
   * the flow is end-to-end testable without an SMTP backend.
   *
   * To avoid account enumeration, an unknown email is answered the same way as
   * a known one: a 200 with a generic message and no token.
   */
  async requestReset(email: string): Promise<{ token: string | null }> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      return { token: null };
    }

    const token = randomBytes(32).toString('hex');
    user.resetTokenHash = this.hashToken(token);
    user.resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await this.userRepository.save(user);

    return { token };
  }

  /**
   * Verifies a raw reset token against the stored hash and, when valid and
   * unexpired, replaces the user's password. The token is single-use: it is
   * cleared as soon as the password is updated.
   */
  async confirmReset(
    email: string,
    token: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new BadRequestException('Reset token is invalid or has expired.');
    }

    const isExpired =
      !user.resetTokenExpiresAt || user.resetTokenExpiresAt.getTime() < Date.now();
    const tokenMismatch =
      !user.resetTokenHash || this.hashToken(token) !== user.resetTokenHash;

    if (isExpired || tokenMismatch) {
      throw new BadRequestException('Reset token is invalid or has expired.');
    }

    user.password = await this.hashService.hashPassword(newPassword);
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    await this.userRepository.save(user);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
