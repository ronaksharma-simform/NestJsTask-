import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { PasswordResetController } from '../../src/auth/password-reset.controller';
import { PasswordResetService } from '../../src/auth/password-reset.service';
import { HashService } from '../../src/utils/hash.services';
import { UserDTO } from '../../src/auth/dto/user.dto';

describe('Password reset (e2e)', () => {
  let app: INestApplication<App>;

  const users: UserDTO[] = [
    {
      id: 'user-1',
      username: 'alice',
      email: 'alice@example.com',
      password: 'old-password-hash',
      is_private: false,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      created_at: new Date(),
      deleted_at: null,
      posts: [],
      comment: [],
    } as unknown as UserDTO,
  ];

  const mockUserRepository = {
    findOneBy: jest.fn(async ({ email }: { email: string }) => {
      return users.find((u) => u.email === email) ?? null;
    }),
    save: jest.fn(async (user: UserDTO) => {
      const index = users.findIndex((u) => u.id === user.id);
      if (index >= 0) {
        users[index] = user;
      } else {
        users.push(user);
      }
      return user;
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PasswordResetController],
      providers: [
        PasswordResetService,
        HashService,
        { provide: getRepositoryToken(UserDTO), useValue: mockUserRepository },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('request reset stores a hashed reset token and returns the raw token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/password-reset/request')
      .send({ email: 'alice@example.com' })
      .expect(200);

    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.token).not.toHaveLength(0);

    const user = users.find((u) => u.email === 'alice@example.com');
    expect(user?.resetTokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(user?.resetTokenHash).not.toBe(response.body.token);
    expect(user?.resetTokenExpiresAt).toBeInstanceOf(Date);
    expect(user?.resetTokenExpiresAt?.getTime()).toBeGreaterThan(Date.now());
  });

  it('request reset then confirm updates the password and clears the token', async () => {
    const requestResponse = await request(app.getHttpServer())
      .post('/api/auth/password-reset/request')
      .send({ email: 'alice@example.com' })
      .expect(200);

    const token = requestResponse.body.token as string;
    expect(token).toEqual(expect.any(String));

    const confirmResponse = await request(app.getHttpServer())
      .post('/api/auth/password-reset/confirm')
      .send({
        email: 'alice@example.com',
        token,
        newPassword: 'brandNewPassword123',
      })
      .expect(200);

    expect(confirmResponse.body.message).toContain('reset');

    const user = users.find((u) => u.email === 'alice@example.com');
    expect(user?.password).not.toBe('old-password-hash');
    expect(user?.resetTokenHash).toBeNull();
    expect(user?.resetTokenExpiresAt).toBeNull();
  });

  it('request reset for an unknown email returns 200 with no token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/password-reset/request')
      .send({ email: 'nobody@example.com' })
      .expect(200);

    expect(response.body.token).toBeUndefined();
  });

  it('request reset with an invalid email returns 400', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/password-reset/request')
      .send({ email: 'not-an-email' })
      .expect(400);
  });

  it('confirm with a wrong token returns 400', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/password-reset/confirm')
      .send({
        email: 'alice@example.com',
        token: 'wrong-token',
        newPassword: 'brandNewPassword123',
      })
      .expect(400);
  });
});
