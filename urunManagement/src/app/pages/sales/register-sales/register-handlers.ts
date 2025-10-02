import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegisterHandlers {
  visibleCreate: boolean = false;
  headerDialog = '';

  situation = [
    {name: 'Paralı', value: 1},
    {name: 'Askıda (TL)', value: 0}
  ]

  handleInsertDialog() {
    this.visibleCreate = true;
  }

  formartValor(valor: number) {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    return formatter.format(valor).replace('.', '|').replace('.', ',').replace('|', '.');
  }
}
