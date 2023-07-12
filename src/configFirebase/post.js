import {
  collection, db, auth, addDoc, getDocs,
} from './configFirebase.js';

export const publicações = async (mensagem) => {
  const timestamp = new Date().getTime();

  const document = await addDoc(collection(db, 'Post'), {
    name: auth.currentUser.displayName,
    author: auth.currentUser.uid,
    msg: mensagem,
    likes: [],
    timestamp,
  });
  return document;
};

export const retornoPublicacoes = async () => {
  const publicacoes = [];
  const querySnapshot = await getDocs(collection(db, 'Post'));

  querySnapshot.forEach((post) => {
    publicacoes.push({ ...post.data(), id: post.id });
  });

  return publicacoes;
};
