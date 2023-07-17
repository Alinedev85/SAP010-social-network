import './feed.css';
import { publicações, retornoPublicacoes, likePost } from '../../configFirebase/post.js';
import { userStateLogout, userAuthChanged } from '../../configFirebase/auth.js';
import { auth } from '../../configFirebase/configFirebase.js';

export default () => {
  const container = document.createElement('div');

  const template = `
  <div class="container">
    <div class="logo">
      <img src="./images/logo5.png">
    </div>

    <section class="menu">
      <h2 class="saudacao">Olá, <span id="nome-usuario">fulaninho</span>!</h2>
      <h3 class="convite">Possui um convite? Acesse:</h3>
      <ul>
        <li><a href="#cafeComRum">Café com Rum</a></li>
      </ul>
      <button id="logoutButton" class="logout">Deslogar</button>
    </section>

    <section class="filtros">
      <h2 class="saudacao">Acesse também:</h2>
      <ul>
        <li><a href="https://www.conab.gov.br/" target="_blank">Atualizações da Conab.gov.br</a></li>
        <li><a href="https://app.powerbi.com/view?r=eyJrIjoiNDdkNDM4ZjctYzk0OS00NWVjLWFlYjktZWQ4Njg3MDEyMTg0IiwidCI6ImU2ZDkwZGYzLWYxOGItNGJkZC04MDhjLWFhNmQwZjY4YjgwOSJ9" target="_blank">Busca por Armazenadores</a></li>
        <li><a href="https://portaldeinformacoes.conab.gov.br/produtos-360.html" target="_blank">Acompanhe o preço da saca</a></li>
      </ul>
      <img class="fundo" src="./images/background-filtros.png">
    </section>

    <div class="postagens">
      <textarea class="inputMensagem" id="areaMensagem" placeholder="Compartilhe ideias e informações sobre café"></textarea>
      <button class="btnPostagem" id="postagemID">Postar</button>
      <div id="mensagemErro" class="error"></div>
    </div>

    <section id="postagem" class="postagemFeed"></section>
  `;

  container.innerHTML = template;

  const btnPostagem = container.querySelector('#postagemID');
  const btnDeslogar = container.querySelector('#logoutButton');

  btnDeslogar.addEventListener('click', async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('logged out');
      userStateLogout(userAuthChanged);
      window.location.href = '';
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Erro ao deslogar', error);
    }
  });

  async function mostrarPostagem() {
    const publicacoes = await retornoPublicacoes();
    const postagem = container.querySelector('#postagem');
    postagem.innerHTML = '';

    btnPostagem.addEventListener('click', async () => {
      const mensagem = container.querySelector('#areaMensagem').value;
      const mensagemErro = container.querySelector('#mensagemErro');
      if (mensagem.length > 0) {
        await publicações(mensagem);
        container.querySelector('#areaMensagem').value = '';
        await mostrarPostagem();
        mensagemErro.textContent = '';
      } else {
        mensagemErro.textContent = 'Digite sua mensagem!';
      }
    });

    const postagensValidas = publicacoes.filter((post) => !isNaN(post.timestamp));

    postagensValidas.sort((a, b) => b.timestamp - a.timestamp);

    if (postagensValidas.length > 0) {
      postagensValidas.forEach((post) => {
        const publicar = document.createElement('div');

        const timestamp = post.timestamp;
        const date = new Date(timestamp);
        const dataFormatada = date.toLocaleString();

        publicar.innerHTML = `
          <section class='conteudo'>
            <div class='nome-data'>
              <h4 class='nome'> ${post.name}</h3>
              <p class='timestamp'> ${dataFormatada}</p>
            </div>
            <p class='conteudoPag'> ${post.msg}</p>
            <div class='botoes'>
              <button class='botaoCurtir'>Editar</button>
              <button class='botaoExtra'>Deletar</button>
              <a class='btn-like${post.likes && post.likes.includes(auth.currentUser.uid) ? ' liked' : ''}' data-comment-id='${post.id}'>☕️</a>
              <span class="likeCount">${post.likeCount || 0}</span>
              ${post.name === auth.currentUser.displayName}
            </div>
          </section>`;

        postagem.appendChild(publicar);
      });
    }

    const likeButtons = container.querySelectorAll('.btn-like');

    likeButtons.forEach((likeButton) => {
      likeButton.addEventListener('click', async () => {
        const commentId = likeButton.dataset.commentId;
        const userLiked = likeButton.classList.contains('liked');
        await likePost(commentId, !userLiked);

        if (userLiked) {
          likeButton.classList.remove('liked');
          likeButton.textContent = '❤️';
          const likeCountElement = likeButton.nextElementSibling;
          likeCountElement.textContent = parseInt(likeCountElement.textContent, 10) - 1;
        } else {
          likeButton.classList.add('liked');
          likeButton.textContent = '☕️';
          const likeCountElement = likeButton.nextElementSibling;
          likeCountElement.textContent = parseInt(likeCountElement.textContent, 10) + 1;
        }
      });
    });
  }
  mostrarPostagem();

  return container;
};
