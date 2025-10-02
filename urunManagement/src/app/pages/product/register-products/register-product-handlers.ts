import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegisterProductHandlers {
  visibleCreate: boolean = false;
  headerDialog = '';

  handleInsertDialog() {
    this.visibleCreate = true;
  }
  active = [
    {name: 'Aktif', value: true},
    {name: 'InAktif', value: false}
  ]

  formartValor(valor: number) {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    return formatter.format(valor).replace('.', '|').replace('.', ',').replace('|', '.');
  }
}
