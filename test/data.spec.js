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
  
  import { retornoPublicacoes } from '../src/configFirebase/post';
  import {
  db,
  getDocs,
  collection,
  } from '../src/configFirebase/configFirebase';
  
  jest.mock('firebase/auth');
  jest.mock('firebase/firestore');
  
  describe('retornoPublicacoes', () => {
  it('deve retornar as publicações corretamente', async () => {
  const mockPublicacoes = [
  {
  id: '1',
  title: 'Publicação 1',
  },
  {
  id: '2',
  title: 'Publicação 2',
  },
  ];
  
  
  //mock da captura dos ddados 
  const querySnapshotMock = {
    forEach: (callback) => {
      mockPublicacoes.forEach((doc) => {
        callback({
          id: doc.id,
          data: () => ({
            ...doc,
          }),
        });
      });
    },
  };
  
  const getDocsMock = jest.fn(() => Promise.resolve(querySnapshotMock));
  getDocs.mockImplementation(getDocsMock);
  
  const result = await retornoPublicacoes();
  
  expect(getDocsMock).toHaveBeenCalledWith(collection(db, 'Post'));
  expect(result).toEqual(mockPublicacoes);
  
  });
  });
  
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
  // Se a função não lançar um erro falhará no teste
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
  
  // Faz o mock da função getAppAuth
  jest.mock('../src/configFirebase/auth', () => ({
  ...jest.requireActual('../src/configFirebase/auth'), 
  getAppAuth: jest.fn(),
  }));
  
  describe('createUserWithEmail', () => {
  it('deve criar um usuário com email e senha corretos', async () => {
  const name = 'Test User';
  const email = 'test@example.com';
  const password = '123456';
  
  const authMock = {
    createUserWithEmailAndPassword: jest.fn().mockResolvedValueOnce({
      user: {
        displayName: name,
      },
    }),
    updateProfile: jest.fn(), // mmock updateProfile linha31
  };
  getAppAuth.mockReturnValue(authMock);
  
  // mock da janela
  global.window = {
    location: {
      hash: '',
    },
  };
  
  await createUserWithEmail(name, email, password);
  
  expect(getAppAuth).toHaveBeenCalledTimes(1);
  expect(authMock.createUserWithEmailAndPassword).toHaveBeenCalledWith(email, password);
  expect(authMock.updateProfile).toHaveBeenCalledWith({
    displayName: name,
  });
  expect(window.location.hash).toBe('#feed');
  
  });
  });