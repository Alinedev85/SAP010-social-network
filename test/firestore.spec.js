import {
  retornoPublicacoes,
  publicacoes,
  likePost,
} from '../src/configFirebase/post';

import {
  db,
  doc,
  getDocs,
  auth,
  addDoc,
  collection,
} from '../src/configFirebase/configFirebase';

jest.mock('../src/configFirebase/configFirebase');

describe('publicacoes', () => {
  it('deve adicionar um novo post à coleção Firestore', async () => {
    const mockMensagem = 'mensagem de teste';
    const mockTimestamp = 1689688182295;
    addDoc.mockResolvedValueOnce({ id: 'mockPostId' });

    auth.currentUser = {
      uid: '123456',
      displayName: 'Nome do usuário',
    };

    Date.now = jest.fn(() => mockTimestamp);

    const document = await publicacoes(mockMensagem);
    expect(addDoc).toHaveBeenCalledWith(collection(db, 'Post'), {
      name: auth.currentUser.displayName,
      author: auth.currentUser.uid,
      msg: mockMensagem,
      likes: [],
      Timestamp: mockTimestamp,
    });
    expect(document).toEqual({ id: 'mockPostId' });
  });
});

describe('retornoPublicacoes', () => {
  it('deve retornar as publicações corretamente', async () => {
    const mockPublicacoes = [
      {
        id: '1',
        post: 'Publicação 1',
      },
      {
        id: '2',
        post: 'Publicação 2',
      },
    ];

    const querySnapshotMock = {
      forEach: (callback) => {
        mockPublicacoes.forEach((post) => {
          callback({
            id: post.id,
            data: () => ({
              ...post,
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

describe('likePost', () => {
  it('deve adicionar um like corretamente', async () => {
    const mockCommentId = 'commentId';
    const mockCommentDoc = {
      data: jest.fn(() => ({
        likeCount: 0,
        likes: [],
      })),
    };
    const mockAuthUid = 'authUid';
    auth.currentUser.uid = mockAuthUid;
    const mockUpdateDoc = jest.fn();
    const mockArrayUnion = jest.fn();
    const mockGetDoc = jest.fn(() => Promise.resolve(mockCommentDoc));

    jest.mock('firebase/firestore', () => ({
      doc: jest.fn(() => mockCommentDoc),
      updateDoc: mockUpdateDoc,
      arrayUnion: mockArrayUnion,
      arrayRemove: jest.fn(),
      getDoc: mockGetDoc,
    }));

    await likePost(mockCommentId, true);

    expect(doc).toHaveBeenCalledWith(db, 'Post', mockCommentId);
    expect(mockGetDoc).toHaveBeenCalledWith(mockCommentDoc);
    expect(mockUpdateDoc).toHaveBeenCalledWith(mockCommentDoc, {
      likes: mockArrayUnion(mockAuthUid),
      likeCount: +1,
    });
  });

  it('deve remover um like corretamente', async () => {
    const mockCommentId = 'commentId';
    const mockCommentDoc = {
      data: jest.fn(() => ({
        likeCount: -1,
        likes: ['authUid'],
      })),
    };
    const mockAuthUid = 'authUid';
    auth.currentUser.uid = mockAuthUid;
    const mockUpdateDoc = jest.fn();
    const mockArrayRemove = jest.fn();
    const mockGetDoc = jest.fn(() => Promise.resolve(mockCommentDoc));

    jest.mock('firebase/firestore', () => ({
      doc: jest.fn(() => mockCommentDoc),
      updateDoc: mockUpdateDoc,
      arrayUnion: jest.fn(),
      arrayRemove: mockArrayRemove,
      getDoc: mockGetDoc,
    }));

    await likePost(mockCommentId, false);

    expect(doc).toHaveBeenCalledWith(db, 'Post', mockCommentId);
    expect(mockGetDoc).toHaveBeenCalledWith(mockCommentDoc);
    expect(mockUpdateDoc).toHaveBeenCalledWith(mockCommentDoc, {
      likes: mockArrayRemove(mockAuthUid),
      likeCount: 0,
    });
  });
});
