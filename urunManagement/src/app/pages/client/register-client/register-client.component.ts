import { Component, ViewChild, ViewEncapsulation, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { InputNumberModule } from 'primeng/inputnumber';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { NotificationService } from '../../../services/shared/messages/notification.service';
import { Client } from '../../../models/client/client';
import { ClientService } from '../../../services/client/client.service';
import { RegisterClientHandlers } from './register-client-handlers';
@Component({
  selector: 'app-register-client',
  standalone: true,
  imports: [ButtonModule,
    TableModule,
    TagModule,
    ToastModule, 
    RatingModule, 
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ToolbarModule,
    DialogModule,
    ConfirmDialogModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    LoadingComponent,
    InputMaskModule,
    InputTextModule],
  templateUrl: './register-client.component.html',
  styleUrl: './register-client.component.scss',
  providers: [MessageService, NotificationService, ConfirmationService],
  encapsulation: ViewEncapsulation.None,
})
export class RegisterClientComponent implements OnInit{
  @ViewChild('dt') dataTable!: Table;
  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  selectedClients: any = [];
  clients: Client[] = [];
  allClients: Client[] = [];
  loadingTable = false;
  loadingButton = false;
  messageTable = 'Veri bulunamadı';
  isEditMode: boolean = false;
  client!: Client;
  clientId: number = 0;
  isViewing: boolean = false;
  search: string = '';

  createForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: [''],
    location: [''],
    active: ['',Validators.required],
    dateCreate: [{value: '', disabled: true}],
    dateEdit: [{value: '', disabled: true}] 
  })

  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private clientService: ClientService,
    public handlers: RegisterClientHandlers
  ){
    this.titleService.setTitle('Müşteriyi Kaydet')
  }

  ngOnInit() { 
    this.getAllClients();
  }

  ngAfterViewInit() {
    this.loadingComponent.show();
  }

  getAllClients(){
    this.clientService.getAllClients().subscribe({
      next:(response) => {
        this.allClients = response.data.flat();
        if (this.search) {
          this.filterClients(this.search); 
        } else {
          this.clients = [...this.allClients];
        }
        this.loadingComponent.hide();
      },
      error: () => {
        this.messageTable;
        this.loadingComponent.hide();
      }
    })
  }

  deleteClient(id: number) {
    this.confirmationService.confirm({
      message: 'Bu istemciyi silmek istediğinizden emin misiniz?',
      header: 'Onaylamak',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',  
      rejectLabel: 'No',
      accept: () => {
        this.loadingTable = true;
        this.clientService.deleteClient(id).subscribe({
          next: () => {
            this.notificationService.showSuccessToast('Müşteri kaydı başarıyla silindi!');
            this.loadingTable = false;
            this.getAllClients();
          },
          error: (error) => {
            const errorMessage = error?.error?.message ?? 'İşlem sırasında bir hata oluştu.';
            this.notificationService.showErrorToast(errorMessage);
            this.loadingTable = false;
          }
        });
      }
    });
  }

  
  filterGlobal(event: any) {
    this.search = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterClients(this.search);
  }

  filterClients(searchText: string) {
    this.clients = this.allClients.filter(
        (item) =>
            (item.dateCreate && item.dateCreate.includes(searchText)) ||
            (item.name && item.name.toLowerCase().includes(searchText)) ||
            (item.phone && item.phone.toLowerCase().includes(searchText)) ||
            (item.location.toString().includes(searchText)) ||
            (item.active !== undefined && (
                (item.active && 'Aktif'.includes(searchText)) ||
                (!item.active && 'inAktif'.includes(searchText))
        ))
    );
  }

  dialogEdit(client: Client){
    this.isEditMode = true;
    this.isViewing = false;
    this.handlers.headerDialog = 'Müşteriyi Düzenle'
    this.handlers.handleInsertDialog()
    if(!!client.id){
      this.clientId = client.id
    }
    const activeValue = this.handlers.active.find(s => s.value === client.active);
    this.createForm.patchValue({
      name: client.name,
      phone: client.phone,
      active: activeValue,
      location: client.location,
    });
    this.createForm.enable();
  }

  editClient(form: FormGroup) { 
    this.isViewing = false;
    this.loadingButton = true;
    this.client = {
      id: this.clientId,
      name: form.get('name')?.value,
      phone: form.get('phone')?.value,
      active: form.get('active')?.value.value,
      location: form.get('location')?.value
    };
    this.clientService.updateClient(this.client, this.clientId).subscribe({
      next:() => {
        this.notificationService.showSuccessToast('Müşteri kaydı başarıyla güncellendi!')
        this.handlers.visibleCreate = false;
        this.loadingButton = false;
        this.getAllClients()
      },
      error: (error) => {
        const errorMessage = error?.error ?? 'İşlem sırasında bir hata oluştu.';
        this.notificationService.showErrorToast(errorMessage)
        this.loadingButton = false;
      }
    })
  }

  getClientById(id: number) {
    this.isViewing = true; 
    this.handlers.headerDialog = 'Müşteri kaydını görüntüle';
    this.handlers.handleInsertDialog();
  
    if (!!id) {
      this.clientId = id;
    }
    this.clientService.getByIdClient(id).subscribe({
      next: (response) => {
        this.createForm.patchValue({
          name: response.data[0].name,
          phone: response.data[0].phone,
          active: this.handlers.active.find(option => option.value === response.data[0].active), 
          location: response.data[0].location,
          dateCreate: response.data[0].dateCreate ? new Date(response.data[0].dateCreate).toLocaleDateString('pt-BR') : null,
          dateEdit: response.data[0].dateEdit ? new Date(response.data[0].dateEdit).toLocaleDateString('pt-BR') : null,
        });
        this.createForm.disable();
      },

      error: (error) => {
        const errorMessage = error?.error?.message ?? 'İşlem sırasında bir hata oluştu.';
        this.notificationService.showErrorToast(errorMessage);
        this.loadingButton = false;
      }
    });
  }

  CreateOrEdit(form: FormGroup) {
    if (this.isEditMode) {
      this.editClient(form);
    } else {
      this.saveNewClient(form);
    }
  }

  saveNewClient(form: FormGroup){
    if (form.invalid) {
      this.notificationService.showErrorToast('Gerekli tüm alanları doldurun!');
      return;
    }
    this.loadingButton = true;
    this.client = {
      id: this.clientId,
      name: form.get('name')?.value,
      location: form.get('location')?.value,
      active: form.get('active')?.value.value,
      phone: form.get('phone')?.value
    };
    this.clientService.postCreateClient(this.client).subscribe({
      next:() => {
        this.notificationService.showSuccessToast('Müşteri başarıyla kayıt oldu!')
        this.handlers.visibleCreate = false;
        this.loadingButton = false;
        this.getAllClients()
      },
      error: (error) => {
        const errorMessage = error?.error ?? 'İşlem sırasında bir hata oluştu.';
        this.notificationService.showErrorToast(errorMessage)
        this.loadingButton = false;
        this.getAllClients()
      }
    })
  }

  cancel(){
    this.handlers.visibleCreate = false;
  }

  openCreate() {
    this.isViewing = false;
    this.isEditMode = false;
    this.handlers.headerDialog = 'Müşteriyi Kaydet'
    this.createForm.reset();
    this.createForm.patchValue({
      active: this.handlers.active[0]
    });
    this.handlers.handleInsertDialog()
  }
}
