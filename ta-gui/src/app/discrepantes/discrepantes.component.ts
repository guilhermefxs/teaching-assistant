import { Component, OnInit } from '@angular/core';
import {Matricula} from '../../../../common/matricula'
import {Turma} from '../../../../common/turma'
import {DiscrepantesService} from './discrepantes.service'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-discrepantes',
  templateUrl: './discrepantes.component.html',
  styleUrls: ['./discrepantes.component.css']
  
})
export class DiscrepantesComponent implements OnInit {

  nomeTurma: string = ""
  turma: Turma
  matriculas: Matricula[] = []
  cabecalho: String[] = []
  metas: String[] = []
  totalDiscrepantes = 0
  porcentagemDiscrepantes = 0
  totalRealizouAutoAvaliacao = 0
  clicouNoBotao = false
  

  constructor(private discrepantesService: DiscrepantesService) { }

  ngOnInit() {}

  carregarMatriculas(){
    this.totalDiscrepantes = 0
    this.porcentagemDiscrepantes = 0
    this.totalRealizouAutoAvaliacao = 0
    this.metas = []
    
      //Chamando autoavaliacao.service que faz a req pro server para pegar a turma indicada pelo usuário
      this.discrepantesService.getTurma(this.nomeTurma).subscribe(

        (a) => { 

          this.turma = new Turma()
          this.turma.descricao = a.descricao
          this.turma.metas = a.metas
          this.matriculas = this.turma.getMatriculas() 
          this.turma.metas.forEach( meta => {
            this.metas.push(meta)
          })
         
          this.carregaTotalDiscrepantes()
          this.carregaPorcentagemDiscrepantes()
          
        },
        (msg) => { alert(msg.message); }

      )
      
      //Configurando cabecalho
      this.cabecalho = ["Nome", "CPF", "Email"]
     
  }


  carregaTotalDiscrepantes(){
      //Contador para alunos com autoavaliações discrepantes
      var count = 0

      //Intera pelas matriculas da turma 
      this.turma.getMatriculas().forEach((matricula) =>{

        //Checa se o aluno completou as autoaliações
        if(matricula.avaliacoes.length==matricula.autoAvaliacoes.length){
          this.totalRealizouAutoAvaliacao++

          //Checa se o aluno teve autoavaliação discrepante
          if(this.matriculaDiscrepancia(matricula)){
            count++
          }
        }
      })

      this.totalDiscrepantes = count

  }

  carregaPorcentagemDiscrepantes(){
    if(this.totalDiscrepantes==0){
      this.porcentagemDiscrepantes = 0
    }else{
      this.porcentagemDiscrepantes = Math.round((this.totalDiscrepantes/this.totalRealizouAutoAvaliacao)*100)
    }

    this.clicouNoBotao = true

  }
  corDaLinha(matricula: Matricula): String{
    //Checa se foi feita a autoavaliacao de todas as metas
    if(matricula.avaliacoes.length==matricula.autoAvaliacoes.length){
      if(this.matriculaDiscrepancia(matricula)){
        return "discrepante"
      }else{
        return "tr"
      }

    //Caso não tenha sido feita todas as autoavaliacoe
    }else{
      return "incompleta"
    }
   
  }

  matriculaDiscrepancia(matricula: Matricula):boolean{
      var discrepantes = 0

      //Itera pelas avaliações da matriculas
      matricula.avaliacoes.forEach((avaliacao) => {
        
          //Procura a autoavaliação correspondente a essa matricula
          let autoavaliacao = matricula.autoAvaliacoes.find(autoavaliacao => autoavaliacao.meta == avaliacao.meta);
         
          if(avaliacao.nota=="MANA" && autoavaliacao.nota=="MPA"){
              discrepantes++
          }else if(avaliacao.nota=="MANA" && autoavaliacao.nota=="MA"){
            discrepantes++
          }else if(avaliacao.nota=="MPA" && autoavaliacao.nota=="MA"){
            discrepantes++
          }
      })

      //Checando se a autoavaliacao do aluno foi discrepante
      if(discrepantes/matricula.avaliacoes.length>=0.25){
        return true
      }else{
        return false
      }

  }

  nota(selector: boolean, matricula: Matricula, meta: string){

    if(selector){
      let avaliacao = matricula.avaliacoes.find(avaliacao => avaliacao.meta == meta)
      if(avaliacao!= null){
        return avaliacao.nota
      }else{
        return null
      }
    }else{
      let autoavaliacao = matricula.autoAvaliacoes.find(autoavaliacao => autoavaliacao.meta == meta)
      
      if(autoavaliacao != null){
        return autoavaliacao.nota
      }else{
        return null
      }
    }
  }

  totalDiscrepante():Number{
    return this.totalDiscrepantes
  }
  
}

