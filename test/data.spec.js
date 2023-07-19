import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';

import {
  loginWithEmail,
  getAppAuth,
  loginGoogle,
  createUserWithEmail,
} from '../src/configFirebase/auth';

jest.mock('firebase/auth');

describe('loginGoogle', () => {
  it('deverá ser uma função', () => {
    expect(typeof loginGoogle).toEqual('function');
  });

  it('deveria fazer login com a conta do Google', async () => {
    signInWithPopup.mockResolvedValueOnce();
    await loginGoogle();
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
  });

  it('deverá lidar com erros ao fazer login com a conta do Google', async () => {
    const errorMessage = 'Erro ao fazer login com a conta do Google';
    signInWithPopup.toBe(new Error(errorMessage));
    try {
      await loginGoogle();
      throw new Error('A função deveria lançar um erro');
    } catch (error) {
      expect(error.message).toEqual(errorMessage);
    }
  });
});

describe('loginWithEmail', () => {
  it('Devera logar com email e senha corretos', async () => {
    const email = 'teste@coffeestation.com';
    const password = '123456';

    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { displayName: 'Test User' } });

    await loginWithEmail(email, password);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(getAppAuth(), email, password);
  });

  it('Devera mostrar um erro e falhar ao logar o usuario errado', async () => {
    const email = 'teste!coffeestation.com';
    const password = '123456';

    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('E-mail já está em uso'));
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      expect(error.message).toEqual('E-mail já está em uso');
    }
  });
});

// Mock da função getAppAuth
jest.mock('../src/configFirebase/auth', () => ({
  ...jest.requireActual('../src/configFirebase/auth'),
  getAppAuth: jest.fn(),
}));

describe('createUserWithEmail', () => {
  it('deve lidar com erros ao criar um usuário', async () => {
    const name = 'Jose cafeina';
    const email = 'Jose@cafeina.com';
    const senha = '123456';
    const userCredentialMock = jest.fn().mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
    const updateProfileMock = jest.fn();
    const authMock = {
      createUserWithEmailAndPassword: userCredentialMock,
      updateProfile: updateProfileMock,
      currentUser: {},
    };

    getAppAuth.mockReturnValue(authMock);

    try {
      await createUserWithEmail(name, email, senha);
      throw new Error('A função deveria lançar um erro');
    } catch (error) {
      expect(error.code).toBe('auth/email-already-in-use');
    }
    expect(getAppAuth).toHaveBeenCalledTimes(1);
    expect(userCredentialMock).toHaveBeenCalledWith(authMock, email, senha);
    expect(updateProfileMock).toHaveBeenCalledWith(authMock.currentUser, {
      displayName: name,
    });
  });
});
