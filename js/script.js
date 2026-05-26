/* ==========================================================================
   ELEMENTOS DO JOGO (DOM) - PEGANDO AS COISAS DO HTML
   ==========================================================================
   Aqui a gente guarda as referências dos elementos que vamos mexer toda hora:
   a empilhadeira (mario), a cancela (pipe), o placar, as vidas e os botões.
*/

// Velocidade que a cancela vai vir correndo na tela (começa em 10, depois acelera)
var novaVelocidade = 10;
var aceleracao = 2;

// Pegando os elementos da tela para mexer com JavaScript
const mario = document.querySelector(".mario");
const pipe = document.querySelector(".pipe");
const scoreElement = document.querySelector('.score');
const livesContainer = document.querySelector('#lives-container');
const bullet = document.querySelector('.bullet');
const gameOverScreen = document.querySelector('.game-over-screen');
const jogarDenovoScreen = document.querySelector('.tela-jogar-denovo');
const finalScoreElement = document.querySelector('#final-score');
const gameBoard = document.querySelector('.game-board');
const root = document.documentElement;
const clouds = document.querySelector('.clouds');
const starLayer = document.querySelector('#star-layer');
const passioneScreen = document.querySelector('#passioneScreen');
const chao1 = document.querySelector("#img1");
const chao2 = document.querySelector("#img2");
const chao3 = document.querySelector("#img3");
const fundo = document.querySelector('.fundo-gif');

// Definindo a imagem inicial da cancela (o obstáculo)
pipe.src = 'imagens/inimigos/cancela.gif';
pipe.style.width = '150px';
pipe.style.height = '150px';

// Contador de moedas coletadas
var contadorMoeda = 0;
let numeroAleatorio;

/* ==========================================================================
   ELEMENTOS DA TELA INICIAL
   ==========================================================================
   Campos para digitar o nick e o botão de start.
*/
const telaInicial = document.querySelector('.tela-Inicial');
const nicknameInput = document.querySelector('#nickname');
const startButton = document.querySelector('#start-button');

/* ==========================================================================
   ARQUIVOS DE ÁUDIO E IMAGENS
   ==========================================================================
   Carregamos a música de fundo e o barulhinho da moeda.
   Agora os caminhos estão todos em minúsculas e sem underlines para funcionar no Linux do InfinityFree!
*/
var marioGifPath = "imagens/persona/empilhadeira.gif"; // Sprite da empilhadeira
var denovo = false;

// Música clássica do jogo e o barulhinho de pegar moeda
var musicaMario = new Audio("media/sons/fasesons/mariomusica.mp3");
const coinSound = new Audio('media/sons/coin-audio.mp3');

/* ==========================================================================
   ESTADO DO JOGO (CONTROLE)
   ==========================================================================
   Variáveis que dizem se o jogo começou, se tá pausado, quantas vidas o jogador tem, etc.
*/
var inicio = false;
let pausa = false;
let estaInvuneravel = false; // Fica invulnerável após bater e continuar
var vida = 3;
var vidasPerdidas = 0;
let score = 0;
let moedasColetadas = 0;
let playerNick = '';
let loop;
let scoreInterval;

/* ==========================================================================
   FUNÇÕES DO JOGO - O MOTOR DA BRINCADEIRA
   ==========================================================================
*/

/**
 * Mostra os coraçõezinhos de vida na tela.
 * A gente apaga o que tinha antes e cria novas imagens de corações baseadas nas vidas que restam.
 */
function atualizarVidas() {
    livesContainer.innerHTML = ''; // Limpa as vidas atuais
    for (let i = 0; i < vida; i++) {
        const lifeIcon = document.createElement('img');
        lifeIcon.src = 'media/life.gif'; // Ícone de coração
        lifeIcon.classList.add('life-icon');
        livesContainer.appendChild(lifeIcon);
    }
}

/**
 * Faz o personagem pular adicionando a classe CSS de pulo.
 * Depois de 700 milissegundos (o tempo do pulo), remove a classe pra poder pular de novo.
 */
const jump = () => {
    if (!mario.classList.contains("jump")) {
        mario.classList.add('jump');
        if (inicio == true) {
            setTimeout(() => mario.classList.remove('jump'), 700);
        }
    }
};

/**
 * O jogador perdeu uma vida!
 * Reduz o contador de vidas, atualiza o visual da tela e faz a empilhadeira
 * dar uma piscada de cabeça para baixo pra mostrar que bateu.
 */
function perdeVida() {
    vida--;
    atualizarVidas();

    if (vida >= 0) {
        mario.style.transform = "scaleY(-1)"; // Vira de cabeça pra baixo
        setTimeout(() => {
            mario.style.transform = "scaleY(1)"; // Volta ao normal depois de meio segundo
        }, 500);
    }
}

/**
 * Dá um tempinho de imunidade para o jogador depois que ele bate e escolhe continuar.
 * O personagem pisca e não morre se bater nesse meio segundo de trégua.
 */
function ativarInvunerabilidade() {
    estaInvuneravel = true;
    mario.classList.add('invuneravel'); // CSS faz o boneco piscar
    setTimeout(() => {
        estaInvuneravel = false;
        mario.classList.remove('invuneravel');
    }, 500);
}

/**
 * Inicia as engrenagens do jogo!
 * Configura tudo para o estado ativo, toca a música de fundo e liga os loops de colisão e placar.
 */
function startGame() {
    inicio = true;
    mario.style.display = "block";
    fundo.style.display = "block";
    telaInicial.style.display = 'none';
    pipe.style.animationPlayState = 'running'; // Cancela começa a correr
    root.style.setProperty('--velocidade', `2.0s`);
    atualizarVidas();
    acelerar();

    // Placar vai subindo a cada 100 milissegundos
    scoreInterval = setInterval(() => {
        if (!pausa) score++;
        scoreElement.textContent = `Score: ${score}`;

        // A cada 50 pontos, faz aparecer uma moeda em uma altura aleatória do céu
        if (score > 0 && score % 50 == 0) {
            let alturaAleatoria = Math.random() * (200 - 80) + 80;
            criarMoeda(alturaAleatoria);
        }
    }, 100);

    // Faz a cancela correr cada vez mais rápido conforme o score aumenta
    function acelerar() {
        setInterval(() => {
            novaVelocidade = 2 - score / 7500;
            pipe.style.animationDuration = novaVelocidade + "s";
            return;
        }, 3);
    }

    // Loop que checa colisão o tempo todo (a cada 10 milissegundos)
    loop = setInterval(() => {
        if (pausa || estaInvuneravel) return;
        musicaMario.play(); // Garante que a trilha tá rolando

        const marioPositionBottom = +window.getComputedStyle(mario).bottom.replace('px', '');
        const marioPositionLeft = mario.offsetLeft;

        // Checando colisão com cada moedinha na tela
        document.querySelectorAll('.coin').forEach((moeda) => {
            const moedaPositionLeft = moeda.offsetLeft;
            const moedaPositionBottom = +window.getComputedStyle(moeda).bottom.replace('px', '');
            if (
                marioPositionLeft < moedaPositionLeft + 40 &&
                marioPositionLeft + 120 > moedaPositionLeft &&
                marioPositionBottom < moedaPositionBottom + 40 &&
                marioPositionBottom + 120 > moedaPositionBottom
            ) {
                moeda.remove(); // Tira a moeda da tela
                coinSound.play(); // Toca barulhinho de moeda
                score += 10; // Ganha pontuação extra
                moedasColetadas++;
                contadorMoeda++;
                // Ganha uma vida extra a cada 10 moedas coletadas
                if (moedasColetadas % 10 === 0 && moedasColetadas > 0) {
                    vida++;
                    atualizarVidas();
                }
            }
        });

        const pipePosition = pipe.offsetLeft;
        const bulletPosition = bullet.offsetLeft;

        // Checa se a empilhadeira bateu na cancela ou no projétil
        if ((pipePosition <= 120 && pipePosition > 0 && marioPositionBottom < 80) ||
            (bullet.style.display === 'block' && bulletPosition <= 120 && bulletPosition > 0 && marioPositionBottom < 80)) {
            
            pausa = true;
            pipe.style.animationPlayState = 'paused'; // Trava a animação da cancela
            bullet.style.animationPlayState = 'paused'; // Trava a animação do projétil

            if (vida > 0) {
                perdeVida(); // Perde uma vida e mostra tela de continuar
                jogarDenovoScreen.style.display = 'flex';
            } else {
                morrer(pipePosition, bulletPosition, marioPositionBottom); // Acabaram as vidas: game over definitivo
            }
        }
    }, 10);
}

/* ==========================================================================
   EVENT LISTENERS - OUVINTES DE EVENTOS (TECLADO / TOUCH)
   =========================================================================
*/

// Pula quando aperta Espaço (tecla 32)
document.addEventListener('keydown', (event) => {
    if (event.keyCode === 32) {
        jump();
    }
});

// Suporte para pular clicando/tocando em qualquer lugar da tela (Mobile/Touch)
document.addEventListener('touchstart', (event) => {
    if (event.target.tagName !== 'BUTTON' && event.target.tagName !== 'INPUT') {
        jump();
    }
});

// Botão start inicia a jogatina se o jogador escreveu o nick
startButton.addEventListener('click', () => {
    const nick = nicknameInput.value.trim();
    if (nick) {
        playerNick = nick;
        startGame();
    } else {
        alert('Por favor, digite um nick para começar!');
    }
});

/**
 * Função que trata a escolha na tela de continuar (após perder uma vida)
 */
function continuarReniciar(escolha) {
    if (escolha === 'continuar') {
        jogarDenovoScreen.style.display = 'none';
        
        // Reposiciona a cancela e o projétil para fora da tela e reativa a animação
        pipe.style.right = '-80px';
        pipe.style.left = '';
        pipe.style.animationPlayState = 'running';
        
        bullet.style.right = '-80px';
        bullet.style.left = '';
        bullet.style.animationPlayState = 'running';
        
        pausa = false;
        ativarInvunerabilidade();
        mario.style.transform = "scaleY(1)"; // Garante que a empilhadeira tá em pé
        mario.src = marioGifPath;
    } else if (escolha === 'Reniciar') {
        window.location.reload(); // Recarrega a página toda
    }
}

/**
 * Acabaram todas as vidas: Game Over definitivo!
 * Para tudo, vira a empilhadeira de ponta cabeça de vez e exibe a pontuação final.
 */
function morrer(pipePosition, bulletPosition, marioPosition) {
    pipe.style.animation = "none";
    pipe.style.left = `${pipePosition}px`;
    
    bullet.style.animation = "none";
    bullet.style.left = `${bulletPosition}px`;
    
    mario.style.animation = "none";
    mario.style.bottom = `${marioPosition}px`;
    mario.style.transform = "scaleY(-1)"; // Vira de cabeça pra baixo definitivo
    
    gameOverScreen.style.display = 'flex'; // Exibe painel de game over
    
    clearInterval(loop);
    clearInterval(scoreInterval);
    finalScoreElement.textContent = score;
}

/**
 * Cria dinamicamente uma moedinha voando no céu.
 * Ela vai correndo na tela usando a animação da cancela e some depois de 4 segundos.
 */
function criarMoeda(bottom) {
    const novaMoeda = document.createElement('img');
    novaMoeda.src = 'imagens/coin.gif'; // Caminho minúsculo
    novaMoeda.classList.add('coin');
    novaMoeda.style.bottom = `${bottom}px`;
    gameBoard.appendChild(novaMoeda);

    setTimeout(() => {
        if (novaMoeda) {
            novaMoeda.remove(); // Remove do DOM para não pesar
        }
    }, 4000);
}

/* ==========================================================================
   INICIALIZAÇÃO DO DOCUMENTO
   ==========================================================================
   Cuida da tela de startup animada inicial e depois mostra o menu do jogo.
*/
document.addEventListener('DOMContentLoaded', () => {
    telaInicial.style.display = 'none'; // Esconde o menu inicial por enquanto
    const startupDisplayTime = 1500; // Tempo de exibição da tela de abertura

    // Faz a transição suave sumindo com a tela de abertura
    function finishStartup() {
        passioneScreen.classList.add('fade-out');
        setTimeout(() => {
            passioneScreen.remove(); // Tira a tela de abertura do código
            telaInicial.style.display = 'flex'; // Mostra a tela inicial de digitação de Nick
        }, 1000);
    }
    setTimeout(finishStartup, startupDisplayTime);
});

// Lógica de pulo pelo botão mobile arcade (clicando ou tocando)
const jumpButtonMobile = document.getElementById("jump-button-mobile");
if (jumpButtonMobile) {
    jumpButtonMobile.addEventListener('touchstart', (event) => {
        event.preventDefault();
        if (inicio) {
            jump();
        }
    });
    jumpButtonMobile.addEventListener('mousedown', (event) => {
        if (inicio) {
            jump();
        }
    });
}
