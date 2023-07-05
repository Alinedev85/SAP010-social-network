
import { collection, db, auth, addDoc, getDocs} from "../configFirebase/configFirebase.js";


//criar postagem de usuarios/ id automatico 
export const publicações = async (mensagem) => {
  const document = await addDoc (collection(db, 'Post'), {
    name: auth.currentUser.displayName,
    author: auth.currentUser.uid,
    msg: mensagem,
    likes: [2],
  });
  return document;
}  

