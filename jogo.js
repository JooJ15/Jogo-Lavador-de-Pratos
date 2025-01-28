(function() {
    const cerebro_do_jogo = {
      duracaoJogo: 120, // Duração do jogo em segundos
      intervaloGeracaoPratos: 5000, // Intervalo entre geração de pratos em milissegundos
      chancesGeracaoPratos: [30, 25, 20, 25], // Chances de gerar 2, 4, 6 ou 0 pratos
      chancesGeracaoPratosAlta: [25, 20, 5, 50], // Chances quando uma pilha está cheia
      tamanhoComando: 5, // Número de setas na sequência de comandos
      pontuacaoBase: 10, // Pontos base para completar um prato
      deducaoErro: 5, // Pontos deduzidos para cada erro
      duracaoMensagemErro: 1000, // Duração para mostrar a mensagem de erro em milissegundos
      maxPratosPorPilha: 10, // Número máximo de pratos por pilha
      atrasoMudancaFundo: 1000, // Atraso antes de mudar o fundo de volta ao normal
      imagensPratosSujos: ['prato_de_frente_sujo.png', 'prato_de_frente_sujo2.png', 'prato_de_frente_sujo3.png'], // Array de imagens de pratos sujos
      duracaoCenaCorte: 1000, // Duração da cena de corte em milissegundos
    };
    let estadoJogo = {
      temporizador: cerebro_do_jogo.duracaoJogo,
      pratos: [
        [],
        []
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
    botaoIniciar.addEventListener('click', iniciarJogo);
    botaoReiniciar.addEventListener('click', iniciarJogo);
    document.addEventListener('keydown', tratarTeclaPressionada);
    telaCenaCorte.addEventListener('click', encerrarCenaCorte);
    document.addEventListener('keydown', encerrarCenaCorte);

    function iniciarJogo() {
      estadoJogo = {
        temporizador: cerebro_do_jogo.duracaoJogo,
        pratos: [
          [],
          []
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
      telaInicial.style.display = 'none';
      telaFinal.style.display = 'none';
      telaJogo.style.display = 'block';
      pilhasPratos.forEach(pilha => pilha.innerHTML = ''); // Limpa pratos anteriores
      atualizarTemporizador();
      containerComandos.style.display = 'none';
      iniciarCenaCorte();
    }

    function iniciarCenaCorte() {
      telaCenaCorte.style.display = 'flex';
      document.getElementById('container-jogo').style.backgroundImage = "url('fundo2.png')";
    }

    function encerrarCenaCorte(evento) {
      if (telaCenaCorte.style.display === 'flex') {
        evento.preventDefault();
        telaCenaCorte.style.display = 'none';
        document.getElementById('container-jogo').style.backgroundImage = "url('fundo.png')";
        setTimeout(() => {
          estadoJogo.intervaloJogo = setInterval(atualizarJogo, 1000);
          estadoJogo.intervaloPratos = setInterval(gerarPratos, cerebro_do_jogo.intervaloGeracaoPratos);
          atualizarPontuacao();
        }, cerebro_do_jogo.duracaoCenaCorte);
      }
    }

    function atualizarJogo() {
      estadoJogo.temporizador--;
      atualizarTemporizador();
      if (estadoJogo.temporizador <= 0 || (estadoJogo.pratos[0].length >= cerebro_do_jogo.maxPratosPorPilha && estadoJogo.pratos[1].length >= cerebro_do_jogo.maxPratosPorPilha)) {
        encerrarJogo();
      }
    }

    function atualizarTemporizador() {
      const minutos = Math.floor(estadoJogo.temporizador / 60);
      const segundos = estadoJogo.temporizador % 60;
      elementoTemporizador.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;
    }

    function gerarPratos() {
      const numeroAleatorio = Math.random() * 100;
      let pratosParaGerar = 0;
      const chances = estadoJogo.pratos[0].length >= cerebro_do_jogo.maxPratosPorPilha ? cerebro_do_jogo.chancesGeracaoPratosAlta : cerebro_do_jogo.chancesGeracaoPratos;
      if (numeroAleatorio < chances[0]) {
        pratosParaGerar = 2;
      } else if (numeroAleatorio < chances[0] + chances[1]) {
        pratosParaGerar = 4;
      } else if (numeroAleatorio < chances[0] + chances[1] + chances[2]) {
        pratosParaGerar = 6;
      }
      if (pratosParaGerar > 0) {
        document.getElementById('container-jogo').style.backgroundImage = "url('fundo2.png')";
        mostrarImagemGar(pratosParaGerar);
        setTimeout(() => {
          document.getElementById('container-jogo').style.backgroundImage = "url('fundo.png')";
          document.getElementById('gar1').style.display = 'none';
          document.getElementById('gar2').style.display = 'none';
          document.getElementById('gar3').style.display = 'none';
        }, cerebro_do_jogo.atrasoMudancaFundo);
      }
      for (let i = 0; i < pratosParaGerar; i++) {
        let indicePilha = 0;
        if (estadoJogo.pratos[0].length >= cerebro_do_jogo.maxPratosPorPilha) {
          indicePilha = 1;
        }
        if (estadoJogo.pratos[indicePilha].length < cerebro_do_jogo.maxPratosPorPilha) {
          const prato = document.createElement('div');
          prato.className = 'prato';
          prato.style.bottom = `${estadoJogo.pratos[indicePilha].length * 20}px`;
          pilhasPratos[indicePilha].appendChild(prato);
          estadoJogo.pratos[indicePilha].push(prato);
        }
      }
      gerarComando();
    }

    function mostrarImagemGar(pratosParaGerar) {
      const gar1 = document.getElementById('gar1');
      const gar2 = document.getElementById('gar2');
      const gar3 = document.getElementById('gar3');
      gar1.style.display = 'none';
      gar2.style.display = 'none';
      gar3.style.display = 'none';
      switch (pratosParaGerar) {
        case 2:
          gar1.style.display = 'block';
          break;
        case 4:
          gar2.style.display = 'block';
          break;
        case 6:
          gar3.style.display = 'block';
          break;
      }
    }

    function gerarComando() {
      if (estadoJogo.pratos[0].length + estadoJogo.pratos[1].length === 0) {
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
      if (estadoJogo.pratos[0].length + estadoJogo.pratos[1].length === 0 || estadoJogo.comandoAtual.length === 0) {
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
          if (estadoJogo.pratos[0].length + estadoJogo.pratos[1].length > 0) {
            let indicePilha;
            if (estadoJogo.pratos[1].length > 0) {
              indicePilha = 1;
            } else {
              indicePilha = 0;
            }
            const pratoRemovido = estadoJogo.pratos[indicePilha].pop();
            pilhasPratos[indicePilha].removeChild(pratoRemovido);
            // Ajustar a posição dos pratos restantes
            estadoJogo.pratos[indicePilha].forEach((prato, indice) => {
              prato.style.bottom = `${indice * 20}px`; 
            });
            const pontosGanhos = Math.max(cerebro_do_jogo.pontuacaoBase - (estadoJogo.errosPratoAtual * cerebro_do_jogo.deducaoErro), 0);
            estadoJogo.pontuacao += pontosGanhos;
            atualizarPontuacao();
            // Muda imagem do prato sujo
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
  })();