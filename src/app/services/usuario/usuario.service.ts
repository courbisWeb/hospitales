import { Injectable } from '@angular/core';
import { Usuario } from './../../models/usuario.model';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from 'src/app/config/config';
import {map} from 'rxjs/operators';
import swal from 'sweetalert';
import { Router } from '@angular/router';
import { SubirArchivoService } from '../subir-archivo/subir-archivo.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  usuario: Usuario;
  token: string;

  constructor(
    public http: HttpClient,
    public router: Router,
    public _subirArchivoService: SubirArchivoService
  ) {
    this.cargarStorage();
  }

  logout() {
    this.usuario = null;
    this.token = '';

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  cargarStorage() {
    if (localStorage.getItem('token')) {
      this.token = localStorage.getItem('token');
      this.usuario = JSON.parse(localStorage.getItem('usuario'));
    } else {
      this.token='';
      this.usuario = null;
    }
  }

  estaLogueado() {
    return ( this.token.length > 1 ) ? true : false;
  }

  guardarStorage( id: string, token: string, usuario: Usuario ) {
    localStorage.setItem('id', id);
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuario = usuario;
    this.token = token;
  }

  loginGoogle( token: string ) {
    let url = URL_SERVICIOS + '/login/google';

    return this.http.post( url, { token } )
    .pipe(map((resp: any) => {
      this.guardarStorage(resp.id, resp.token, resp.usuarioDB);
      return true;
  }));

  }

  login( usuario: Usuario, recordar: boolean= false ) {

    if ( recordar ) {
      localStorage.setItem('email', usuario.email);
    } else {
      localStorage.removeItem('email');
    }

    let url = URL_SERVICIOS + '/login';
    return this.http.post(url, usuario)
    .pipe(map((resp: any) => {
      this.guardarStorage(resp.id, resp.token, resp.usuarioDB);
        return true;
    }));
  }

  crearUsuario( usuario: Usuario ) {

    let url = URL_SERVICIOS + '/usuario';

    return this.http.post( url, usuario )
    .pipe(map( (resp: any) => {
      swal('Usuario creado', usuario.email, 'success');
      return resp.usuario;
    }));

  }

  actualizarUsuario( usuario: Usuario ) {
    let url = URL_SERVICIOS + '/usuario/' + usuario._id;
    url += '?token=' + this.token;
    return this.http.put(url, usuario)
    .pipe(map( (resp: any) => {
      this.guardarStorage(resp.usuario._id, this.token, resp.usuario);
      swal('Usuario actualizado ', usuario.nombre, 'success');
      return true;
    }));
  }

  cambiarImagen( archivo: File, id: string ) {
    this._subirArchivoService.subirArchivo(archivo, 'usuarios', id)
      .then( (resp: any) => {
        this.usuario.img = resp.usuarioActualizado.img;
        swal('Imagen actualizada', resp.usuarioActualizado.nombre, 'success');
        this.guardarStorage(id, this.token, resp.usuarioActualizado);
      })
      .catch( resp => {
        console.log(resp);
      })
  }

}


