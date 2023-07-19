import {
  retornoPublicacoes,
  publicacoes,
  likePost,
} from '../src/configFirebase/post';

import {
  db,
  doc,
  getDocs,
  getDoc,
  auth,
  addDoc,
  collection,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from '../src/configFirebase/configFirebase';

jest.mock('../src/configFirebase/configFirebase');

describe('publicacoes', () => {
  it('deve adicionar um novo post à coleção Firestore', async () => {
    const mockMensagem = 'mensagem de teste';
    const mockTimestamp = 1689688182295;
    const mockAddDoc = jest.fn();

    addDoc.mockResolvedValueOnce({ id: 'mockPostId' });

    auth.currentUser = {
      uid: '123456',
      displayName: 'Nome do usuário',
    };

    Date.getTime = jest.fn(() => mockTimestamp);

    const document = await publicacoes(mockMensagem);
    expect(mockAddDoc).toHaveBeenCalledWith(collection(db, 'Post'), {
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
        Post: 'Publicação 1',
      },
      {
        id: '2',
        Post: 'Publicação 2',
      },
    ];

    const querySnapshotMock = {
      forEach: (callback) => {
        mockPublicacoes.forEach((Post) => {
          callback({
            id: Post.id,
            data: () => ({
              ...Post,
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
  beforeEach(() => {
    auth.currentUser = {
      uid: 'mockAuthUid',
    };
  });

  it('deve adicionar um like corretamente', async () => {
    const mockCommentId = 'commentId';
    const mockCommentData = {
      likeCount: 0,
      likes: [],
    };

    const mockCommentRef = doc(db, 'Post', mockCommentId);
    const mockCommentDoc = {
      data: jest.fn(() => mockCommentData),
    };

    getDoc.mockResolvedValueOnce(mockCommentDoc);
    updateDoc.mockResolvedValueOnce();

    await likePost(mockCommentId, true);

    expect(doc).toHaveBeenCalledWith(db, 'Post', mockCommentId);
    expect(getDoc).toHaveBeenCalledWith(mockCommentRef);
    expect(updateDoc).toHaveBeenCalledWith(mockCommentRef, {
      likes: arrayUnion(auth.currentUser.uid),
      likeCount: 1,
    });
  });

  it('deve remover um like corretamente', async () => {
    const mockCommentId = 'commentId';
    const mockCommentData = {
      likeCount: 1,
      likes: ['mockAuthUid'],
    };

    const mockCommentRef = doc(db, 'Post', mockCommentId);
    const mockCommentDoc = {
      data: jest.fn(() => mockCommentData),
    };

    getDoc.mockResolvedValueOnce(mockCommentDoc);
    updateDoc.mockResolvedValueOnce();

    await likePost(mockCommentId, false);

    expect(doc).toHaveBeenCalledWith(db, 'Post', mockCommentId);
    expect(getDoc).toHaveBeenCalledWith(mockCommentRef);
    expect(updateDoc).toHaveBeenCalledWith(mockCommentRef, {
      likes: arrayRemove(auth.currentUser.uid),
      likeCount: 0,
    });
  });
});
