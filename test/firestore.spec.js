import {
  retornoPublicacoes,
  publicações,
} from '../src/configFirebase/post';

import {
  db,
  getDocs,
  collection,
  auth,
  addDoc,
} from '../src/configFirebase/configFirebase';

jest.mock('firebase/firestore');
jest.mock('../src/configFirebase/configFirebase');

describe('publicações', () => {
  it('deve adicionar um novo post à coleção Firestore', async () => {
    const mockMensagem = 'mensagem de teste';
    const mockTimestamp = 1689609377626;
    const addDocMock = jest.fn(() => Promise.resolve({ id: 'mockPostId' }));
    addDoc.mockImplementation(addDocMock);

    auth.currentUser = {
      displayName: 'João do café',
      uid: '123456',
    };
    const originalDateNow = Date.now;
    global.Date.now = jest.fn(() => mockTimestamp);
    const document = await publicações(mockMensagem);
    global.Date.now = originalDateNow;

    expect(addDocMock).toHaveBeenCalledWith(collection(db, 'Post'), {
      name: auth.currentUser.displayName,
      author: auth.currentUser.uid,
      msg: mockMensagem,
      likes: [],
      timestamp: mockTimestamp,
    });
    expect(document).toEqual({ id: 'mockPostId' });
  });
});

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
    expect(result).toEqual(mockPublicacoes);
  });
});
