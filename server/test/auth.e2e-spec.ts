import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { SignupController } from '../../src/auth/signup.controller';
import { AuthService } from '../../src/auth/auth.service';
import { HashService } from '../../src/utils/hash.services';
import { UserDTO } from '../../src/auth/dto/user.dto';
import { AppJwtModule } from '../../src/jwt/jwt.module';

describe('Auth signup (e2e)', () => {
  let app: INestApplication<App>;

  const savedUsers: UserDTO[] = [];
  const mockUserRepository = {
    create: jest.fn((data: Partial<UserDTO>) => data as UserDTO),
    save: jest.fn(async (data: Partial<UserDTO>) => {
      const user = { id: 'test-user-id', ...data } as UserDTO;
      savedUsers.push(user);
      return user;
    }),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppJwtModule],
      controllers: [SignupController],
      providers: [
        AuthService,
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

  it('signup creates user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: 'qa@example.com', password: 'password123' })
      .expect(201);

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.accessToken).not.toHaveLength(0);
    expect(savedUsers).toHaveLength(1);
    expect(savedUsers[0].email).toBe('qa@example.com');
    expect(savedUsers[0].password).not.toBe('password123');
  });
});
