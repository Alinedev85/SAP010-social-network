import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { loginGoogle, loginWithEmail, getAppAuth } from '../src/configFirebase/auth';
import { publicações } from '../src/configFirebase/post';

jest.mock('firebase/auth');

describe('publicações', () => {
  it('deve ser uma função', () => {
    expect(typeof publicações).toBe('function');
  });

  it('deve adicionar um documento com os dados corretos', async () => {
    const mensagem = 'Mensagem de teste';
    const displayName = 'Nome do Autor';
    const uid = 'ID do Autor';

    const collection = jest.fn((db, collectionName) => collectionName);
    const addDoc = jest.fn(async (collectionName, data) => ({
      name: 'Nome do Documento',
      author: uid,
      msg: data.msg,
      likes: [],
      timestamp: 123456789,
    }));

    const db = 'Mocked Firestore Database';

    const result = await publicações(mensagem);

    expect(collection).toHaveBeenCalledWith(db, 'Post');
    expect(addDoc).toHaveBeenCalledWith('Post', {
      name: displayName,
      author: uid,
      msg: mensagem,
      likes: [],
      timestamp: expect.any(Number),
    });
    expect(result).toEqual({
      name: 'Nome do Documento',
      author: uid,
      msg: mensagem,
      likes: [],
      timestamp: 123456789,
    });
  });
});

describe('loginGoogle', () => {
  it('deve ser uma função', () => {
    expect(typeof loginGoogle).toBe('function');
  });

  it('deve fazer login com a conta do Google', async () => {
    signInWithPopup.mockResolvedValueOnce();
    await loginGoogle();
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
  });
});

describe('loginWithEmail', () => {
  it('deve logar com email e senha corretos', async () => {
    const email = 'teste@coffeestation.com';
    const password = '123456';

    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { displayName: 'Test User' } });

    await loginWithEmail(email, password);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(getAppAuth(), email, password);
  });

  it('deve mostrar um erro e falhar ao logar com o usuário errado', async () => {
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
