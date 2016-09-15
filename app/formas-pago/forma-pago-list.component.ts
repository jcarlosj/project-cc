// Imports del core de Angular 2 necesarios para este componente
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// Imports personalizados necesarios para este componente
import { FormaPagoService }   from './forma-pago.service';
import { FormaPago } from './forma-pago';

// Decorator
@Component({
	templateUrl: '../app/formas-pago/forma-pago-list.component.html',
})

// Clase principal para este componente
export class FormaPagoListComponent implements OnInit, OnDestroy {
	
	// Atributes
	private arrObj: FormaPago[];
	private selectedObj: FormaPago;
	private selectedId: string;
	private sub: any;
	private error: any;
	private title = 'Listado formas de pago';
	private botonBorrar = 'Borrar';
	private botonNuevo = 'Nueva formas de pago';

	// Constructor
	constructor(
		private service: FormaPagoService,
		private route: ActivatedRoute,
		private router: Router
	) { }

	// Implements de Angular 2
	ngOnInit() {
			this.sub = this .route
											.params
											.subscribe( params => {
													this.selectedId = params['codigo'];
													this.service.getRecords()
        											.then( obj => this.arrObj = obj );
											});
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

	// Methods
  isSelected( obj: FormaPago ) { 
		return obj.codigo === this.selectedId; 
	}

  onSelect( obj: FormaPago ) {
    this .router .navigate( [ '/forma_pago', obj.codigo ] );
  }
  add(){
	  //let o: FormaPago;
		//this.selectedObj = new FormaPago();		
	  this .router .navigate(['/forma_pago', this.selectedObj ]);
  }

	delete( obj: FormaPago, event: any ) {
    event.stopPropagation();
		 
    this .service .delete( obj )
                  .then( res => {
          						this .arrObj = this .arrObj .filter( h => h !== obj );
          						
											if ( this.selectedObj === obj ) { 
												this.selectedObj = null; 
											}
        					})
        .catch( error => this.error = error );
  }
}