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
    expect(typeof loginGoogle).toBe('function');
  });

  it('deveria fazer login com a conta do Google', async () => {
    signInWithPopup.mockResolvedValueOnce();
    await loginGoogle();
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
  });

  it('deverá lidar com erros ao fazer login com a conta do Google', async () => {
    const errorMessage = 'Erro ao fazer login com a conta do Google';
    signInWithPopup.mockRejectedValueOnce(new Error(errorMessage));
    try {
      await loginGoogle();
      throw new Error('A função deveria lançar um erro');
    } catch (error) {
      expect(error.message).toBe(errorMessage);
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
    const email = 'teste@coffeestation.com';
    const password = '123456';

    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Erro ao logar usuário'));
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      expect(error.message).toEqual('Erro ao logar usuário');
    }
  });
});

// mock da função getAppAuth
jest.mock('../src/configFirebase/auth', () => ({
  ...jest.requireActual('../src/configFirebase/auth'),
  getAppAuth: jest.fn(),
}));

describe('createUserWithEmail', () => {
  it('deve lidar com erros ao criar um usuário', async () => {
    const name = 'Jose cafeina ';
    const email = 'Jose@cafeina.com';
    const password = '123456';
    const errorMessage = 'Erro ao criar usuário';
    const authMock = {
      createUserWithEmailAndPassword: jest.fn().mockRejectedValueOnce({ message: errorMessage }),
      updateProfile: jest.fn(),
    };
    getAppAuth.mockReturnValue(authMock);
    // moockda janela
    global.window = {
      location: {
        hash: '',
      },
    };
    try {
      await createUserWithEmail(name, email, password);
    } catch (error) {
      expect(error.message).toBe(errorMessage);
    }
    expect(getAppAuth).toHaveBeenCalledTimes(1);
    expect(authMock.createUserWithEmailAndPassword).toHaveBeenCalledWith(email, password);
    expect(authMock.updateProfile).toHaveBeenCalledWith(authMock.currentUser, {
      displayName: name,
    });
    expect(window.location.hash).toBe('');
  });
});
