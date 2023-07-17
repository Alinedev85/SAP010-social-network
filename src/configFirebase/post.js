import {
  collection,
  db,
  auth,
  addDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  doc,
  deleteDoc,
} from './configFirebase';

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

export async function likePost(commentId, like) {
  const commentRef = doc(db, 'Post', commentId);
  const commentDoc = await getDoc(commentRef);
  const authUid = auth.currentUser.uid;
  const commentData = commentDoc.data();

  const likeCount = commentData.likeCount || 0;

  if (like && (!commentData.likes || !commentData.likes.includes(authUid))) {
    await updateDoc(commentRef, {
      likes: arrayUnion(authUid),
      likeCount: likeCount + 1,
    });
  }

  if (!like && commentData.likes && commentData.likes.includes(authUid)) {
    await updateDoc(commentRef, {
      likes: arrayRemove(authUid),
      likeCount: likeCount - 1,
    });
  }
}

export const retornoPublicacoes = async () => {
  const publicacoes = [];
  const querySnapshot = await getDocs(collection(db, 'Post'));

  querySnapshot.forEach((post) => {
    publicacoes.push({ ...post.data(), id: post.id });
  });

  return publicacoes;
};

export async function deletePost(postId) {
  await deleteDoc(doc(db, 'Post', postId));
}
