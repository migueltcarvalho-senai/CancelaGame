/* =========================================
   SELEÇÃO DE ELEMENTOS DO JOGO (DOM)
   =========================================
   Aqui, guardamos em constantes as referências
   aos elementos HTML que serão manipulados
   durante o jogo, como o personagem, obstáculos e telas.
*/

var novaVelocidade = 10
var aceleracao = 2

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
pipe.src = '_imagens/inimigos/goomba.gif';
pipe.style.width = '150px';
pipe.style.height = '150px';

var contadorMoeda = 0
let numeroAleatorio;
/* =========================================
   ELEMENTOS DA TELA INICIAL
   =========================================
   Referências aos elementos da primeira tela
   que o jogador vê, onde ele insere o nickname.
*/
const telaInicial = document.querySelector('.tela-Inicial');
const nicknameInput = document.querySelector('#nickname');
const startButton = document.querySelector('#start-button');
/* =========================================
   RECURSOS DE ÁUDIO E IMAGENS PADRÃO
   =========================================
   Pré-carregamento dos arquivos de áudio e
   definição de imagens padrão para o jogo.
*/
var marioGifPath = "./_imagens/persona/mario.gif";
var denovo = false;
var musicaMario = new Audio("_media/_sons/faseSons/MarioMusica.mp3");

const selectSound = new Audio('./_media/_sons/undertale-select.mp3');
const coinSound = new Audio('./_media/_sons/coin-audio.mp3');
var localGameOver = './_imagens/morte/game-over-mario.png';
/* =========================================
   VARIÁVEIS DE ESTADO DO JOGO
   =========================================
   Variáveis que controlam o estado atual do
   jogo, como pontuação, vidas, pausa, etc.
*/
var inicio = false;
let pausa = false;
let estaInvuneravel = false;
var vida = 3;
var vidasPerdidas = 0;
let score = 0;
let moedasColetadas = 0;
let playerNick = '';
let loop;
let scoreInterval;
let personagemSelecionadoId = 'marioDiv';
var spriteMorteTemporario = '_imagens/morte/mario morte.png';
/* =========================================
   FLAGS DE CONTROLE DE TEMA
   =========================================
   Variáveis booleanas para garantir que as
   mudanças de tema (tarde, noite, inferno)
   aconteçam apenas uma vez.
*/
let tardeAtivada = false;
let noiteAtivada = false;
let infernoAtivado = false;
/* =========================================
   FUNÇÕES PRINCIPAIS DE JOGABILIDADE
   =========================================
   Funções que controlam as ações básicas
   do jogador e do jogo.
*/

/**
 * Atualiza os ícones de vida na tela.
 * Ela limpa o contêiner de vidas e o recria
 * com o número atual de vidas do jogador.
 */
function atualizarVidas() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < vida; i++) {
        const lifeIcon = document.createElement('img');

        lifeIcon.src = './_media/life.gif';
        lifeIcon.classList.add('life-icon');
        livesContainer.appendChild(lifeIcon);
    }
};
/**
 * Controla a ação de pulo do personagem.
 */
const jump = () => {
    if (!mario.classList.contains(".jump")) {
        mario.classList.add('jump');
        if (inicio == true) {
            setTimeout(() => mario.classList.remove('jump'), 700);
        }
    }
};
/**
 * Chamada quando o jogador colide com um obstáculo.
 * Reduz uma vida, atualiza a tela e, se houver
 * vidas restantes, mostra o sprite de morte temporária.
 */
function perdeVida() {
    vida--;
    atualizarVidas();

    if (vida >= 0) {
        mario.src = spriteMorteTemporario;
    }
};
/**
 * Ativa um curto período de invulnerabilidade
 * após o jogador perder uma vida e continuar.
 */
function ativarInvunerabilidade() {
    estaInvuneravel = true;
    mario.classList.add('invuneravel');
    setTimeout(() => {
        estaInvuneravel = false;
        mario.classList.remove('invuneravel');
    }, 500);
};
// buff invulnerabilidade do powerup estrela
function BuffInvulnerabilidade() {
    estaInvuneravel = true;
    mario.classList.add('animacao-estrela');
    setTimeout(() => {
        estaInvuneravel = false;
        mario.classList.remove('animacao-estrela');
    }, 5000);
};
/* =========================================
   FUNÇÕES DE EFEITOS VISUAIS
   =========================================
   Funções que criam elementos dinâmicos para
   melhorar a estética do jogo.
*/
function criarBrasa() {
    const ember = document.createElement('div');
    ember.classList.add('ember');
    ember.style.left = `${Math.random() * 100}%`;
    ember.style.animationDelay = `${Math.random() * 3}s`;
    gameBoard.appendChild(ember);
};
/* =========================================
   FUNÇÃO PRINCIPAL DO JOGO (STARTGAME)
   =========================================
   Esta é a função central que controla todo o
   fluxo do jogo, iniciando os loops de
   pontuação e de colisão.
*/
function startGame() {
    inicio = true;
    mario.style.display = "block";
    fundo.style.display = "block";
    telaInicial.style.display = 'none';
    pipe.style.animationPlayState = 'running';
    root.style.setProperty('--velocidade', `2.0s`);
    atualizarVidas();
    bmo()
    shadow()
    acelerar()

    scoreInterval = setInterval(() => {
        if (!pausa) score++;
        scoreElement.textContent = `Score: ${score}`;

        // LÓGICA DE BULLET
        // if (score >= 500 && bullet.style.display !== 'block') {
        //     bullet.style.display = 'block';
        //     bullet.style.animationPlayState = 'running';
        // }

        // LÓGICA DE MOEDAS
        if (score > 0 && score % 50 == 0) {
            let alturaAleatoria = Math.random() * (200 - 80) + 80;
            criarMoeda(alturaAleatoria);
        }
    }, 100);
    // AUMENTO PROGRESSIVO DE VELOCIDADE
    function acelerar() {
        setInterval(() => {
            novaVelocidade = 2 - score / 7500
            pipe.style.animationDuration = novaVelocidade + "s";
            console.log(pipe.style.animationDuration)
            return;

        }, 3);

    }



    // LOOP PRINCIPAL DE VERIFICAÇÃO DE COLISÃO
    loop = setInterval(() => {
        if (pausa || estaInvuneravel) return;
        musicaMario.play();

        const marioPositionBottom = +window.getComputedStyle(mario).bottom.replace('px', '');
        const marioPositionLeft = mario.offsetLeft;

        // VERIFICA COLISÃO COM MOEDAS
        document.querySelectorAll('.coin').forEach((moeda) => {
            const moedaPositionLeft = moeda.offsetLeft;
            const moedaPositionBottom = +window.getComputedStyle(moeda).bottom.replace('px', '');
            if (
                marioPositionLeft < moedaPositionLeft + 40 &&
                marioPositionLeft + 120 > moedaPositionLeft &&
                marioPositionBottom < moedaPositionBottom + 40 &&
                marioPositionBottom + 120 > moedaPositionBottom
            ) {
                moeda.remove();
                coinSound.play();
                score += 10;
                moedasColetadas++;
                contadorMoeda++;
                if (moedasColetadas % 10 === 0 && moedasColetadas > 0) {
                    vida++;
                    atualizarVidas();
                }
            }
        });

        const pipePosition = pipe.offsetLeft;
        const bulletPosition = bullet.offsetLeft;

        // VERIFICA COLISÃO COM OBSTÁCULOS
        if ((pipePosition <= 120 && pipePosition > 0 && marioPositionBottom < 80) ||
            (bullet.style.display === 'block' && bulletPosition <= 120 && bulletPosition > 0 && marioPositionBottom < 80)) {
            pausa = true;
            pipe.style.animationPlayState = 'paused';
            bullet.style.animationPlayState = 'paused';

            if (vida > 0) {
                perdeVida(); // Chama a função de perder vida
                jogarDenovoScreen.style.display = 'flex';
            } else {
                morrer(pipePosition, bulletPosition, marioPositionBottom);
            }
        }
    }, 10);
};
/* =========================================
   EVENT LISTENERS (OUVINTES DE EVENTOS)
   =========================================
   Código que "escuta" ações do usuário,
   como pressionar teclas ou clicar em botões.
*/
document.addEventListener('keydown', (event) => {
    if (event.keyCode === 32) {
        jump();
    }
});

startButton.addEventListener('click', () => {
    const nick = nicknameInput.value.trim();
    if (nick) {
        playerNick = nick;
        startGame();
    } else {
        alert('Por favor, digite um nick para começar!');
    }
});
/* =========================================
   FUNÇÕES DE LÓGICA DE MENU E ESTADO
   =========================================
   Funções que gerenciam a seleção de
   personagens, a tela de "continuar" e o
   estado final de "Game Over".
*/
function escolhaPersonagem(personagem) {
    selectSound.currentTime = 0;
    selectSound.play();

    if (personagemSelecionadoId) {
        document.getElementById(personagemSelecionadoId).classList.remove('selecionado');
    };
    const novaSelecaoDiv = document.getElementById(`${personagem}Div`);
    if (novaSelecaoDiv) {
        novaSelecaoDiv.classList.add('selecionado');
        personagemSelecionadoId = `${personagem}Div`;
    };
    var gameOverImagePath = `./_imagens/morte/Game over mario.png`;
    mudarDirecao = false;
    var chaoGifPath = "./_imagens/chao/chaomario.png";

    switch (personagem) {
        case 'mario':
            gameBoard.style.background = "linear-gradient( #87ceeb, #e0f6ff)";
            musicaMario = new Audio('./_media/_sons/faseSons/MarioMusica.mp3');
            marioGifPath = './_imagens/persona/mario.gif';
            gameOverImagePath = './_imagens/morte/mario morte.png';
            pipe.src = './_imagens/inimigos/goomba.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            chaoGifPath = './_imagens/chao/chaomario.gif';;
            mario.style.width = '170px';
            clouds.style.width = "370px";
            clouds.src = "./_imagens/nuvems/mario.png";
            fundo.src = './_imagens/fundos/fundomario.png';
            fundo.style.bottom = "0";
            break;
        case 'luigi':
            gameBoard.style.background = "linear-gradient( #87ceeb, #e0f6ff)";
            musicaMario = new Audio('./_media/_sons/faseSons/MarioMusica.mp3');
            marioGifPath = './_imagens/persona/luigi.gif';
            gameOverImagePath = './_imagens/morte/luigi morte.png';
            pipe.src = './_imagens/inimigos/goomba.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            chaoGifPath = './_imagens/chao/chaomario.gif';;
            mario.style.width = '170px';
            clouds.style.width = "370px";
            clouds.src = "./_imagens/nuvems/mario.png";
            fundo.src = './_imagens/fundos/fundomario.png';
            fundo.style.bottom = "0";
            break;
        case 'sonic':
            gameBoard.style.background = "linear-gradient( #07085eff, #1647c4ff, #4fc0edff )";
            fundo.src = './_imagens/fundos/fundosonic.png';
            musicaMario = new Audio('./_media/_sons/faseSons/Sonic2.mp3');
            pipe.src = './_imagens/inimigos/carangueijo.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            marioGifPath = './_imagens/persona/sonic.gif';
            gameOverImagePath = './_imagens/morte/sonic morte.png';
            chaoGifPath = './_imagens/chao/chaosonic.gif';
            mario.style.width = '150px';
            clouds.src = "./_imagens/nuvems/sonic.gif";
            clouds.style.width = "370px";
            break;
        case 'dexter':
            gameBoard.style.background = "linear-gradient(#000000ff, #000000ff )";
            fundo.src = './_imagens/fundos/fundodexter.png';
            musicaMario = new Audio('./_media/_sons/faseSons/ovelha.mp3');
            pipe.src = './_imagens/inimigos/foguete.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            marioGifPath = './_imagens/persona/dexter.gif';
            gameOverImagePath = './_imagens/morte/dexter Morte.png';
            chaoGifPath = './_imagens/chao/chaodexter.gif';
            mario.style.width = '170px';
            clouds.src = "./_imagens/nuvems/nuvemdexter.gif";
            clouds.style.width = "370px";
            break;
        case 'florzinha':
            pipe.src = './_imagens/inimigos/macaco.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            musicaMario = new Audio('./_media/_sons/faseSons/MeninasSuperpoderosasTurbo.mp3');
            marioGifPath = './_imagens/persona/florzinha.gif';
            gameOverImagePath = './_imagens/morte/florzinha morte.png';
            chaoGifPath = './_imagens/chao/chaomenina.gif';
            mario.style.width = '170px';
            fundo.src = './_imagens/fundos/fundomenina.png'
            gameBoard.style.background = 'linear-gradient( #f5cfecff , #ffadeb, #ff7ee0  )';
            clouds.style.width = "370px";
            clouds.src = "./_imagens/nuvems/menina.png";
            break;
        case 'osso':
            pipe.src = './_imagens/inimigos/gaveira.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            musicaMario = new Audio('./_media/_sons/faseSons/PuroOsso.mp3');
            marioGifPath = './_imagens/persona/puro.gif';
            gameOverImagePath = './_imagens/morte/puro morte.png';
            chaoGifPath = './_imagens/chao/chaopuro.gif';
            mario.style.width = '170px';
            fundo.src = '_imagens/fundos/fundopuro.png';
            gameBoard.style.background = " linear-gradient( #0b7b56ff, #07463bff, #000000)";
            clouds.src = "./_imagens/nuvems/puro.png";
            clouds.style.width = "370px";
            break;
        case 'shadow':
            pipe.src = '_imagens/inimigos/carangueijo.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            musicaMario = new Audio('./_media/_sons/faseSons/shadow.mp3');
            marioGifPath = "_imagens/persona/shadow.gif";
            mario.style.width = '150px';
            gameOverImagePath = './_imagens/morte/shadow morte.png';
            chaoGifPath = "_imagens/chao/chaoshadow.gif";
            fundo.src = "_imagens/fundos/fundoshadow.png";
            gameBoard.style.background = " linear-gradient( #8b1b1bff, #3b0707ff, #02020cff)";
            clouds.src = "_imagens/nuvems/sonic.gif";
            clouds.style.width = "370px";
            break;
        case 'tails':
            pipe.src = '_imagens/inimigos/carangueijo.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            musicaMario = new Audio('./_media/_sons/faseSons/tails.mp3');
            marioGifPath = "_imagens/persona/tails.gif";
            mario.style.width = '150px';
            gameOverImagePath = './_imagens/morte/tails morte.png';
            chaoGifPath = "_imagens/chao/chaotails.gif";
            fundo.src = "_imagens/fundos/fundotails.png";
            gameBoard.style.background = " linear-gradient( #ec5a16ff, #e78c16ff, #f5cb40ff )";
            clouds.src = "_imagens/nuvems/tails.gif";
            clouds.style.width = "370px";
            break;
        case 'bmo':
            pipe.src = '_imagens/inimigos/gunter.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            musicaMario = new Audio('./_media/_sons/faseSons/HoraDeAventura.mp3');
            marioGifPath = "_imagens/persona/bmo.gif";
            mario.style.width = '150px';
            gameOverImagePath = './_imagens/morte/bmo morte.png';
            chaoGifPath = "_imagens/chao/chaoaventura.gif";
            fundo.src = "_imagens/fundos/fundoaventura.png";
            gameBoard.style.background = " linear-gradient( #6ce5e9ff, #2586c7ff, #1d3586ff )";
            clouds.src = "_imagens/nuvems/nuvemaventura.gif";
            clouds.style.width = "370px";
            break;
        case 'finn':
            pipe.src = '_imagens/inimigos/gunter.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            musicaMario = new Audio('./_media/_sons/faseSons/HoraDeAventura.mp3');
            marioGifPath = "_imagens/persona/finn.gif";
            mario.style.width = '210px';
            gameOverImagePath = './_imagens/morte/finn morte.png';
            chaoGifPath = "_imagens/chao/chaoaventura.gif";
            fundo.src = "_imagens/fundos/fundoaventura.png";
            gameBoard.style.background = " linear-gradient( #8fe9ecff, #3ea2e6ff, #1c2e68ff )";
            clouds.src = "_imagens/nuvems/nuvemaventura.gif";
            clouds.style.width = "370px";
            break;
        case 'ben10':
            pipe.src = '_imagens/inimigos/ben10.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            musicaMario = new Audio('./_media/_sons/faseSons/ben10.mp3');
            marioGifPath = "_imagens/persona/ben10.gif";
            mario.style.width = '170px';
            gameOverImagePath = './_imagens/morte/ben10 morte.png';
            chaoGifPath = "_imagens/chao/chaoben10.gif";
            fundo.src = "_imagens/fundos/fundoben10.png";
            gameBoard.style.background = " linear-gradient( #000000ff, #5b499cff, #4c229bff )";
            clouds.src = "_imagens/nuvems/ben10.gif";
            clouds.style.width = "370px";
            break;
        case 'mordecai':
            pipe.src = '_imagens/inimigos/rigby.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            musicaMario = new Audio('./_media/_sons/faseSons/mordecai.mp3');
            marioGifPath = "_imagens/persona/mordecai.gif";
            mario.style.width = '170px';
            gameOverImagePath = './_imagens/morte/mordecai morte.png';
            chaoGifPath = "_imagens/chao/chaoben10.gif";
            fundo.src = "_imagens/fundos/fundoben10.png";
            gameBoard.style.background = " linear-gradient( #000000ff, #2e44c4ff, #1127a5ff )";
            clouds.src = "_imagens/nuvems/nuvem show.gif";
            clouds.style.width = "370px";
            break;
        case 'rex':
            pipe.src = '_imagens/inimigos/ben10.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            musicaMario = new Audio('./_media/_sons/faseSons/rex.mp3');
            marioGifPath = "_imagens/persona/rex.gif";
            mario.style.width = '170px';
            gameOverImagePath = './_imagens/morte/rex morte.png';
            chaoGifPath = "_imagens/chao/chaoben10.gif";
            fundo.src = "_imagens/fundos/fundoben10.png";
            gameBoard.style.background = " linear-gradient( #000000ff, #633909ff, #8a610aff )";
            clouds.src = "_imagens/nuvems/ben10.gif";
            clouds.style.width = "370px";
            break;
        case 'lindinha':
            pipe.src = './_imagens/inimigos/macaco.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            musicaMario = new Audio('./_media/_sons/faseSons/MeninasSuperpoderosasTurbo.mp3');
            marioGifPath = './_imagens/persona/lindinha.gif';
            gameOverImagePath = './_imagens/morte/lindinha morte.png';
            chaoGifPath = './_imagens/chao/chaomenina.gif';
            mario.style.width = '170px';
            fundo.src = './_imagens/fundos/fundomenina.png'
            gameBoard.style.background = 'linear-gradient( #cff4f5ff , #adecffff, #7eecffff  )';
            clouds.style.width = "370px";
            clouds.src = "./_imagens/nuvems/lindinha.png";
            break;
        case 'docinho':
            pipe.src = './_imagens/inimigos/macaco.gif';
            pipe.style.width = '150px';
            pipe.style.height = '150px';
            musicaMario = new Audio('./_media/_sons/faseSons/MeninasSuperpoderosasTurbo.mp3');
            marioGifPath = './_imagens/persona/docinho.gif';
            gameOverImagePath = './_imagens/morte/docinho morte.png';
            chaoGifPath = './_imagens/chao/chaomenina.gif';
            mario.style.width = '170px';
            fundo.src = './_imagens/fundos/fundomenina.png'
            gameBoard.style.background = 'linear-gradient( #cff5d5ff , #adffbfff, #7effafff  )';
            clouds.style.width = "370px";
            clouds.src = "./_imagens/nuvems/docinho.png";
            break;
        default:
            console.warn(`Personagem '${personagem}' não reconhecido. Usando Mario padrão.`);
            break;
    }

    mario.src = marioGifPath;
    spriteMorteTemporario = gameOverImagePath;

    mario.style.transform = mudarDirecao ? 'scaleX(-1)' : 'scaleX(1)';
    chao1.src = chaoGifPath;
    chao2.src = chaoGifPath;
    chao3.src = chaoGifPath;
};

function continuarReniciar(escolha) {
    if (escolha === 'continuar') {

        jogarDenovoScreen.style.display = 'none';
        // cano volta para o lugar
        pipe.style.right = '-80px';
        pipe.style.left = '';
        pipe.style.animationPlayState = 'running';
        // bala reinicia
        bullet.style.right = '-80px';
        bullet.style.left = '';
        bullet.style.animationPlayState = 'running';
        pausa = false;
        // ativa a invulnerabilidade
        ativarInvunerabilidade();
        mario.src = marioGifPath;

    } else if (escolha === 'Reniciar') {
        window.location.reload();
    }
};

function morrer(pipePosition, bulletPosition, marioPosition) {
    // cano para
    pipe.style.animation = "none";
    pipe.style.left = `${pipePosition}px`;
    // bala para
    bullet.style.animation = "none";
    bullet.style.left = `${bulletPosition}px`;
    // mario para
    mario.style.animation = "none";
    mario.style.bottom = `${marioPosition}px`;
    mario.src = localGameOver;
    mario.style.width = '75px';
    mario.style.marginLeft = '50px';
    gameOverScreen.style.display = 'flex';
    clearInterval(loop);
    clearInterval(scoreInterval);
    finalScoreElement.textContent = score;
    salvarPontuacao(playerNick, score);
};
function salvarPontuacao(nomeJogador, pontuacaoFinal) {
    if (typeof window.salvarScoreRanking === 'function') {
        window.salvarScoreRanking(nomeJogador, pontuacaoFinal);
    }
};

function criarMoeda(bottom) {
    const novaMoeda = document.createElement('img');
    novaMoeda.src = './_imagens/coin.gif';
    novaMoeda.classList.add('coin');
    novaMoeda.style.bottom = `${bottom}px`;
    gameBoard.appendChild(novaMoeda);

    setTimeout(() => {
        if (novaMoeda) {
            novaMoeda.remove();
        }
    }, 4000);
};
/* =========================================
   INICIALIZAÇÃO DA PÁGINA
   =========================================
   Código que executa assim que a página é
   carregada, como a tela de startup.
*/
document.addEventListener('DOMContentLoaded', () => {
    const marioDiv = document.getElementById('marioDiv');
    if (marioDiv) {
        marioDiv.classList.add('selecionado');
    }

    // LÓGICA DA TELA DE STARTUP COM IMAGEM
    telaInicial.style.display = 'none';
    const startupDisplayTime = 1500; // 3 segundos

    function finishStartup() {
        passioneScreen.classList.add('fade-out');
        setTimeout(() => {
            passioneScreen.remove();
            telaInicial.style.display = 'flex';
        }, 1000);
    }
    setTimeout(finishStartup, startupDisplayTime);
});
function bmo() {
    if (playerNick == "papai") {
        marioGifPath = './_imagens/persona/bmo.gif';
        pipe.src = "_imagens/inimigos/gunter.gif";
        pipe.style.width = '150px';
        pipe.style.height = '150px';
        gameOverImagePath = './_imagens/morte/Bmo Morte.png';
        chaoGifPath = './_imagens/chao/chaoaventura.gif';
        mario.style.width = '170px';
        mario.src = marioGifPath;
        spriteMorteTemporario = gameOverImagePath;
        gameBoard.style.background = " linear-gradient( #6ce5e9ff, #2586c7ff, #1d3586ff)";
        chao1.src = chaoGifPath;;
        chao2.src = chaoGifPath;;
        chao3.src = chaoGifPath;;
        clouds.style.width = "370px";
        musicaMario = new Audio('./_media/_sons/faseSons/HoraDeAventura.mp3');
        fundo.src = './_imagens/fundos/fundoaventura.png';
    }
};

function shadow() {
    if (playerNick == "shadow") {
        marioGifPath = "_imagens/persona/shadow.gif"
        chaoGifPath = "_imagens/chao/chaosonic.gif"
        chao1.src = chaoGifPath
        mario.src = marioGifPath
        fundo.src = "_imagens/fundos/fundosonic.png"
        gameBoard.style.background = " linear-gradient( #8b1b1bff, #3b0707ff, #02020cff)";
        pipe.src = '_imagens/inimigos/carangueijo.gif'
        clouds.src = "_imagens/nuvems/sonic.gif"
    }
}
const modalPersonagem = document.getElementById("modalPerso")

var modalAberto = false

function abrirModalPerso() {
    if (modalAberto == false) {
        modalPersonagem.style.display = "flex"
        modalAberto = true
    }

}
function fecharModalPerso() {
    if (modalAberto == true) {
        modalPersonagem.style.display = "none"
        modalAberto = false

    }
}
window.addEventListener('click', (evento) => {
    if (evento.target === modalPersonagem) {
        fecharModalPerso();
    }
});


