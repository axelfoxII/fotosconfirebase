import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL  } from "firebase/storage";
import { Observable } from 'rxjs';
import { FileItem } from '../models/files-items';

@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {

  private CARPETA_IMAGENES = 'img';
  constructor(private firestore:AngularFirestore) { }

  cargarImagenesFirebase(imagenes:FileItem[]){
    const storage = getStorage();
    for(const item of imagenes){

      item.estaSubiendo = true;
      if (item.progreso >= 100) {
        continue;
      }

      const storageRef = ref(storage, `${this.CARPETA_IMAGENES}/${item.nombreArchivo}`);

      const uploadTask = uploadBytesResumable(storageRef, item.archivo);

      

      uploadTask.on('state_changed', (snapshot) => {

        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        item.progreso= progress;   
     
      },(err)=>{
        console.log('error al subir archoivo',err);
      },
      ()=>{

        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          item.url= downloadURL;
          item.estaSubiendo = false;
          this.guardarImagen({
            nombre:item.nombreArchivo,
            url: item.url
          });
        });

      }
      )
    }
  }

  guardarImagen(imagen:{nombre:string, url:string}):Promise<any> {
    return this.firestore.collection(`imagenes`).add(imagen);
  }
}
