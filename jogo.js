class Nodo {
  constructor(valor) {
    this.valor = valor;
    this.proximo = null;
  }
}

class ListaEncadeada {
  constructor() {
    this.head = null;
    this.tamanho = 0;
  }

  inserir(valor) {
    const novoNodo = new Nodo(valor);
    if (!this.head) {
      this.head = novoNodo;
    } else {
      let atual = this.head;
      while (atual.proximo) {
        atual = atual.proximo;
      }
      atual.proximo = novoNodo;
    }
    this.tamanho++;
  }

  remover() {
    if (!this.head) return null;
    const valorRemovido = this.head.valor;
    this.head = this.head.proximo;
    this.tamanho--;
    return valorRemovido;
  }

  percorrer(callback) {
    let atual = this.head;
    let indice = 0;
    while (atual) {
      callback(atual.valor, indice);
      atual = atual.proximo;
      indice++;
    }
  }

  tamanhoAtual() {
    return this.tamanho;
  }
}

(function() {
  const cerebro_do_jogo = {
    duracaoJogo: 120, 
    intervaloGeracaoPratos: 5000,
    chancesGeracaoPratos: [30, 25, 20, 25],
    chancesGeracaoPratosAlta: [25, 20, 5, 50],
    tamanhoComando: 5,
    pontuacaoBase: 10,
    deducaoErro: 5,
    duracaoMensagemErro: 1000,
    maxPratosPorPilha: 10,
    atrasoMudancaFundo: 1000,
    imagensPratosSujos: ['prato_de_frente_sujo.png', 'prato_de_frente_sujo2.png', 'prato_de_frente_sujo3.png'],
    duracaoCenaCorte: 1000,
  };

  let estadoJogo = {
    temporizador: cerebro_do_jogo.duracaoJogo,
    pratos: [
      new ListaEncadeada(),
      new ListaEncadeada()
    ],
    comandoAtual: [],
    pontuacao: 0,
    intervaloJogo: null,
    intervaloPratos: null,
    errosPratoAtual: 0,
    progressoAtual: 0,
    indicePratoSujoAtual: 0,
    cenaCorteMostrada: false,
  };

  const telaInicial = document.getElementById('tela-inicial');
  const telaJogo = document.getElementById('tela-jogo');
  const telaFinal = document.getElementById('tela-final');
  const telaCenaCorte = document.getElementById('cena-corte');
  const botaoIniciar = document.getElementById('botao-iniciar');
  const botaoReiniciar = document.getElementById('botao-reiniciar');
  const elementoTemporizador = document.getElementById('temporizador');
  const pilhasPratos = [
    document.getElementById('pilha-pratos-1'),
    document.getElementById('pilha-pratos-2')
  ];
  const containerComandos = document.getElementById('container-comandos');
  const pratoSujo = document.getElementById('prato-sujo');
  const caixaComandos = document.getElementById('caixa-comandos');
  const elementoPontuacao = document.getElementById('pontuacao');
  const elementoPontuacaoFinal = document.getElementById('pontuacao-final');
  const mensagemErro = document.getElementById('mensagem-erro');
  const imagensGar = [
    document.getElementById('gar1'),
    document.getElementById('gar2'),
    document.getElementById('gar3')
  ];

  botaoIniciar.addEventListener('click', exibirCutsceneInicial);
  botaoReiniciar.addEventListener('click', iniciarJogo);
  document.addEventListener('keydown', tratarTeclaPressionada);
  document.addEventListener('keydown', encerrarCenaCorte);

  function exibirCutsceneInicial() {
    telaInicial.style.display = 'none';
    telaCenaCorte.style.display = 'flex';
    elementoTemporizador.style.display = 'none';
    elementoPontuacao.style.display = 'none';
  }

  function encerrarCenaCorte(evento) {
    if (telaCenaCorte.style.display === 'flex') {
      evento.preventDefault();
      telaCenaCorte.style.display = 'none';
      iniciarJogo();
    }
  }

  function iniciarJogo() {
    estadoJogo = {
      temporizador: cerebro_do_jogo.duracaoJogo,
      pratos: [
        new ListaEncadeada(),
        new ListaEncadeada()
      ],
      comandoAtual: [],
      pontuacao: 0,
      intervaloJogo: null,
      intervaloPratos: null,
      errosPratoAtual: 0,
      progressoAtual: 0,
      indicePratoSujoAtual: 0,
      cenaCorteMostrada: false,
    };
    telaFinal.style.display = 'none';
    telaJogo.style.display = 'block';
    elementoTemporizador.style.display = 'block';
    elementoPontuacao.style.display = 'block';
    pilhasPratos.forEach(pilha => pilha.innerHTML = ''); // Limpa pratos anteriores
    atualizarTemporizador();
    containerComandos.style.display = 'none';
    estadoJogo.intervaloJogo = setInterval(atualizarJogo, 1000);
    estadoJogo.intervaloPratos = setInterval(gerarPratos, cerebro_do_jogo.intervaloGeracaoPratos);
    gerarComando();
  }

  function atualizarJogo() {
    estadoJogo.temporizador--;
    atualizarTemporizador();
    if (estadoJogo.temporizador <= 0 || (estadoJogo.pratos[0].tamanhoAtual() >= cerebro_do_jogo.maxPratosPorPilha && estadoJogo.pratos[1].tamanhoAtual() >= cerebro_do_jogo.maxPratosPorPilha)) {
      encerrarJogo();
    }
  }

  function gerarPratos() {
    const numeroAleatorio = Math.random() * 100;
    let pratosParaGerar = 0;
    const chances = estadoJogo.pratos[0].tamanhoAtual() >= cerebro_do_jogo.maxPratosPorPilha ? cerebro_do_jogo.chancesGeracaoPratosAlta : cerebro_do_jogo.chancesGeracaoPratos;
    if (numeroAleatorio < chances[0]) {
      pratosParaGerar = 2;
    } else if (numeroAleatorio < chances[0] + chances[1]) {
      pratosParaGerar = 4;
    } else if (numeroAleatorio < chances[0] + chances[1] + chances[2]) {
      pratosParaGerar = 6;
    }

    if (pratosParaGerar > 0) {
      mostrarAnimacaoGar(pratosParaGerar);
    }

    for (let i = 0; i < pratosParaGerar; i++) {
      let indicePilha = 0;
      if (estadoJogo.pratos[0].tamanhoAtual() >= cerebro_do_jogo.maxPratosPorPilha) {
        indicePilha = 1;
      }
      if (estadoJogo.pratos[indicePilha].tamanhoAtual() < cerebro_do_jogo.maxPratosPorPilha) {
        const prato = document.createElement('div');
        prato.className = 'prato';
        prato.style.bottom = `${estadoJogo.pratos[indicePilha].tamanhoAtual() * 20}px`;
        pilhasPratos[indicePilha].appendChild(prato);
        estadoJogo.pratos[indicePilha].inserir(prato);
      }
    }
    gerarComando();
  }

  function mostrarAnimacaoGar(pratosParaGerar) {
    imagensGar.forEach(gar => gar.style.display = 'none');
    document.getElementById('container-jogo').style.backgroundImage = "url('fundo2.png')";

    let gar;
    if (pratosParaGerar === 2) gar = imagensGar[0];
    else if (pratosParaGerar === 4) gar = imagensGar[1];
    else if (pratosParaGerar === 6) gar = imagensGar[2];

    if (gar) gar.style.display = 'block';

    setTimeout(() => {
      document.getElementById('container-jogo').style.backgroundImage = "url('fundo.png')";
      imagensGar.forEach(gar => gar.style.display = 'none');
    }, cerebro_do_jogo.atrasoMudancaFundo);
  }

  function gerarComando() {
    if (estadoJogo.pratos[0].tamanhoAtual() + estadoJogo.pratos[1].tamanhoAtual() === 0) {
      containerComandos.style.display = 'none';
      pratoSujo.style.display = 'none';
      estadoJogo.comandoAtual = [];
      return;
    }

    if (estadoJogo.comandoAtual.length === 0) {
      estadoJogo.comandoAtual = [];
      caixaComandos.innerHTML = '';
      pratoSujo.style.display = 'block';
      pratoSujo.style.backgroundImage = `url('${cerebro_do_jogo.imagensPratosSujos[estadoJogo.indicePratoSujoAtual]}')`;

      const setas = ['↑', '↓', '←', '→'];
      for (let i = 0; i < cerebro_do_jogo.tamanhoComando; i++) {
        const setaAleatoria = setas[Math.floor(Math.random() * setas.length)];
        estadoJogo.comandoAtual.push(setaAleatoria);

        const elementoSeta = document.createElement('div');
        elementoSeta.className = 'seta';
        elementoSeta.textContent = setaAleatoria;
        caixaComandos.appendChild(elementoSeta);
      }

      containerComandos.style.display = 'flex';
      caixaComandos.style.display = 'flex';
    }
  }

  function tratarTeclaPressionada(evento) {
    if (estadoJogo.pratos[0].tamanhoAtual() + estadoJogo.pratos[1].tamanhoAtual() === 0 || estadoJogo.comandoAtual.length === 0) {
      return;
    }
    const tecla = evento.key;
    let seta = '';
    switch (tecla) {
      case 'ArrowUp':
        seta = '↑';
        break;
      case 'ArrowDown':
        seta = '↓';
        break;
      case 'ArrowLeft':
        seta = '←';
        break;
      case 'ArrowRight':
        seta = '→';
        break;
      default:
        return;
    }
    if (seta === estadoJogo.comandoAtual[estadoJogo.progressoAtual]) {
      caixaComandos.children[estadoJogo.progressoAtual].classList.add('correta');
      estadoJogo.progressoAtual++;
      if (estadoJogo.progressoAtual === estadoJogo.comandoAtual.length) {
        if (estadoJogo.pratos[0].tamanhoAtual() + estadoJogo.pratos[1].tamanhoAtual() > 0) {
          let indicePilha;
          if (estadoJogo.pratos[1].tamanhoAtual() > 0) {
            indicePilha = 1;
          } else {
            indicePilha = 0;
          }
          const pratoRemovido = estadoJogo.pratos[indicePilha].remover();
          pilhasPratos[indicePilha].removeChild(pratoRemovido);
          estadoJogo.pratos[indicePilha].percorrer((prato, indice) => {
            prato.style.bottom = `${indice * 20}px`;
          });
          const pontosGanhos = Math.max(cerebro_do_jogo.pontuacaoBase - (estadoJogo.errosPratoAtual * cerebro_do_jogo.deducaoErro), 0);
          estadoJogo.pontuacao += pontosGanhos;
          atualizarPontuacao();
          estadoJogo.indicePratoSujoAtual = (estadoJogo.indicePratoSujoAtual + 1) % cerebro_do_jogo.imagensPratosSujos.length;
        }
        estadoJogo.errosPratoAtual = 0;
        estadoJogo.comandoAtual = [];
        estadoJogo.progressoAtual = 0;
        gerarComando();
      }
    } else {
      estadoJogo.errosPratoAtual++;
      mostrarMensagemErro();
      reiniciarCaixaComandos();
    }
  }

  function reiniciarCaixaComandos() {
    Array.from(caixaComandos.children).forEach(seta => {
      seta.classList.remove('correta');
    });
    estadoJogo.progressoAtual = 0;
  }

  function atualizarPontuacao() {
    elementoPontuacao.textContent = `Pontuação: ${estadoJogo.pontuacao}`;
  }

  function encerrarJogo() {
    clearInterval(estadoJogo.intervaloJogo);
    clearInterval(estadoJogo.intervaloPratos);
    telaJogo.style.display = 'none';
    telaFinal.style.display = 'flex';
    elementoPontuacaoFinal.textContent = `Sua pontuação: ${estadoJogo.pontuacao}`;
  }

  function mostrarMensagemErro() {
    mensagemErro.style.display = 'block';
    setTimeout(() => {
      mensagemErro.style.display = 'none';
    }, cerebro_do_jogo.duracaoMensagemErro);
  }

  function atualizarTemporizador() {
    const minutos = Math.floor(estadoJogo.temporizador / 60);
    const segundos = estadoJogo.temporizador % 60;
    elementoTemporizador.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;
  }
})();
