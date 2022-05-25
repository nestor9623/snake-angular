import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IColor } from './select-colors.model';

@Component({
  selector: 'app-select-colors',
  templateUrl: './select-colors.component.html',
  styleUrls: ['./select-colors.component.sass']
})
export class SelectColorsComponent implements OnInit {
  @Output() colorCambio = new EventEmitter<string>();
  colors : IColor[] = [ {id:"Seleccione" , name:"empty"},{id: "Amarillo" ,name:'yellow'},{id: "Rojo" ,name:'red'}, {id: "Azul" ,name:'blue'}];
  colorelegido: any = "Seleccione";
  constructor() { }

  ngOnInit(): void {
  }

  cambioOpcion(event: any){
    const option = this.colors.find((item) => item.id === event)?.name;
    console.log('option', option);
    this.colorCambio.emit(option);
  }
}
