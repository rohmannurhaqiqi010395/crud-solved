import { createClient, updateClient, deleteClient } from './global-query';
import { Component, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import {map} from 'rxjs/operators';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  modalref: BsModalRef;
  public clients_array: Array<any> = [];
  // public link_null: string;
  // title = 'project1';

  //clients company
  cl: any = {};
  company: any;
  client_alias: any;

  constructor(private apollo: Apollo, private modalService: BsModalService )
  {}

  ngOnInit(){
    this.getAllCompanyClients();
  }

  getAllCompanyClients(){
    const getCompanyClients = gql`
    {
      clients(orderBy: company_ASC) {
        id
        company
        client_alias
      }
    }`;
    this.apollo.watchQuery({
      query: getCompanyClients,
      fetchPolicy: 'network-only'
    })
    .valueChanges
    .pipe(map((result: any) => result.data.clients))
    .subscribe((data) => {
      this.clients_array = data;
    })
  }
  testcreate(){
    console.log('Hallo');
    // console.log();
  }
  createClient(cl){
    return this.apollo
    .mutate({
      mutation: createClient,
      variables: {
        company: cl.company,
        client_alias: cl.client_alias
      },
      update: (proxy, {data: { createClient }}) => {
        const data: any = proxy.readQuery({ query: createClient.clients_array });
        data.client.push(createClient);
        proxy.writeQuery({ query: createClient.clients_array, data });
      }
    })
    .subscribe(({ data }) => {
      console.log(data);
      this.closeModal();
      this.getAllCompanyClients();
      Swal.fire(
        'Berhasil',
        'Clients company',
        'success'
      );
    }, (error) => {
        Swal.fire('Failed',
        'Data clients company',
        'error');
    })
  }
  
  //untuk mengecek data yang di update
 test(){
   console.log(this.company);
   console.log(this.client_alias);
 } 
  updateClient(cl){
    // console.log(cl);
    this.apollo
    .mutate({
      mutation: updateClient,
      variables: {
        id: this.cl.id,
        company: this.cl.company,
        client_alias: this.cl.client_alias
      },
      update: (proxy, {data: { updateClient } } ) => {
        const data: any = proxy.readQuery({query: updateClient.clients_array});

        var index = data.clients_array.map( function (x) { return x.id; } ).indexOf(this.cl.id);

        data.clients_array[index].company =cl;
        data.clients_array[index].client_alias =cl;
        // console.log(cl);

        proxy.writeQuery({ query: this.clients_array, data });
      }
    })
    .subscribe(({ data }) => {
      console.log(this.cl);
      this.closeModal();
      this.getAllCompanyClients();
      Swal.fire(
        'Update!',
        'Data telah di update',
        'success'
      );
    }, (error)=>{
      Swal.fire(
        'Gagal',
        'Data gagal di update',
        'error'
      );
    })
  }

  deleteClient(id){
    this.apollo
    .mutate({
      mutation: deleteClient,
      variables: {
        id: id
      },
      update: (proxy, { data: { deleteClient } }) => {
        const data: any = proxy.readQuery({ query: deleteClient.clients_array });

        var index = data.clients_array.map( function (x) { return x.id; }).indexOf(id);

        data.clients_array.splice(index, 1);

        proxy.writeQuery({ query: deleteClient.clients_array, data });
      }
    })
    .subscribe(( { data } ) => {
      this.closeModal();
      this.getAllCompanyClients();
      Swal.fire(
        'Delete!',
        'Data telah di Delete',
        'success'
      );
    }, (error)=>{
      Swal.fire(
        'Gagal',
        'Data gagal di delete',
        'error'
      );
    })
  }

  showUpdateClient(cl, template){
    this.company = cl.company;
    this.client_alias = cl.client_alias;
    this.cl = cl;
    this.modalref = this.modalService.show(template)
  }
  openModal(template: TemplateRef<any>){
    this.modalref = this.modalService.show(template);
  }
  closeModal(){
    this.modalref.hide();
  }
}
