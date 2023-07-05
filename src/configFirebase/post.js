import {
  collection, db, auth, addDoc, getDocs,
} from './configFirebase.js';

// criar postagem de usuarios/ id automatico
export const publicações = async (mensagem) => {
  const document = await addDoc(collection(db, 'Post'), {
    name: auth.currentUser.displayName,
    author: auth.currentUser.uid,
    msg: mensagem,
    likes: [],
  });
  return document;
};

export const retornoPublicacoes = async () => {
  const publicacao = await getDocs(collection(db, 'Post'));
  publicacao.forEach((mensagem) => {
    console.log(mensagem.data());
  });
};
