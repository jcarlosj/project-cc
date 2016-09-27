// Imports del core de Angular 2 necesarios para este componente
import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { ActivatedRoute, Params }             from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule }                from '@angular/forms';
import { Location }                           from '@angular/common';

// Imports personalizados necesarios para este componente
import { Path, Validate }  from '../paths';
import { ProductoService } from './producto.service';
import { Producto }        from './producto';
import { Activaciones }    from '../_tipos/c-activaciones';
import { DataService }     from '../data.service';
import { cEstado }         from '../_tipos/cEstado';

// Decorator
@Component({
  moduleId: module.id,
  selector: 'formas-de-pago',
  templateUrl: 'producto-detail.component.html'
})  

// Clase principal del componente
export class ProductoDetailComponent implements OnInit, OnDestroy {

  // Decorador
  @Output() close = new EventEmitter();

  // Atributes 
  private frmProducto    : FormGroup;
  private vObj            : Producto;
  private codigo          : string;
  private activaciones    : Activaciones[];
  private estado          : cEstado[];
  private sub             : any;
  private esNuevo         : boolean = false;
  private error           : any;
  // Definimos texto boton y titulo
  private title         = 'Producto';
  private botonGuardar  = 'Guardar';
  private botonRegresar = 'Regresar';
  // Carga datos adicionales
  private data: any[];
  private agrupaciones: any;
  private marcas: any;
  private presentaciones: any;
  private tiposDeIva: any;
  private unidades: any;
  private vias: any;
  
  // Constructor
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private service: ProductoService,
    private serviceData: DataService
  ) { 

    // Inicializando atributos
    this.codigo = '';
    this .activaciones = [
        new Activaciones( 'N', 'No' ),
        new Activaciones( 'S', 'Sí' )
    ];
    this.estado = [
        new cEstado( 'A', 'Activo' ),
        new cEstado( 'I', 'Inactivo' )
    ];
  }

  // Implements de Angular 2
  ngOnInit() {

    // Inicializando atributos
    this .frmProducto = new FormGroup({
          //--- IDENTIFICACION DE PRODUCTO ---
          id                   : new FormControl(),
          codigo               : new FormControl(),
          agrupacion           : new FormControl(),
          descripcion1         : new FormControl(),
          descripcion2         : new FormControl(),
          marca                : new FormControl(),
          codigo_barras        : new FormControl(),
          referencia           : new FormControl(),
          equivalencia         : new FormControl(),
          unidad_medida        : new FormControl(),
          unidad_empaque       : new FormControl(),
          ubicacion_bodega     : new FormControl(),
          //--- PRECIOS Y DATOS ESTADISTICOS ---
          precio_venta1        : new FormControl(),
          precio_venta2        : new FormControl(),
          precio_venta3        : new FormControl(),
          precio_venta4        : new FormControl(),
          precio_venta5        : new FormControl(),
          existencia           : new FormControl(),
          saldo_pedido         : new FormControl(),
          costo_promedio       : new FormControl(),   
          costo_ultima_compra  : new FormControl(),
          costo_fob            : new FormControl(), 
          //--- PARAMETROS (Legales) ---
          tipo_iva_venta        : new FormControl(),
          tipo_iva_compra       : new FormControl(),
          registro_invima       : new FormControl(),
          numero_meses_garantia : new FormControl(),
          //--- PARAMETROS (Controles sobre valores y cantidades) ---
          stock_minimo          : new FormControl(),
          stock_maximo          : new FormControl(),
          porc_max_dto_contado  : new FormControl(),
          porc_max_dto_credito  : new FormControl(),
          porc_comision_venta   : new FormControl(),
          //--- PARAMETROS (Si/No) ---
          producto_activo       : new FormControl(),
          producto_se_vende     : new FormControl(),
          precio_fijo           : new FormControl(),
          usa_control_lotes     : new FormControl(),
          aplica_para_pedido    : new FormControl(),
          usa_seriales          : new FormControl(),
          producto_en_consig    : new FormControl(),
          producto_controlado   : new FormControl(),
          permite_negativos     : new FormControl(),
          //--- PARAMETROS (Varios) ---
          color_agenda          : new FormControl(),
          presentacion          : new FormControl(),
          via_administracion    : new FormControl(),
          //codigoBono          : new FormControl(),
          //--- OTROS ---
          //observnew FormControl(),
          //riesgosAsnew FormControl(),
          //--- CONTROL ---
          estado              : new FormControl(),
          registros           : new FormControl()
    });

    this.sub = this.route.params.subscribe(params => {
        /* ---------- 
            13-Ago-2016   -  Fernando Bermeo
            depurando en el navegador se puede observar que el parametro codigo es igual a la cadena
            "undefined", por eso se hacen las dos comparaciones
        ---------- */

        // 
        this .serviceData.getData() .then( data => { 
          this .data = data;
          this .agrupaciones   = this.data['0'].agrupaciones;
          this .marcas         = this.data['0'].marcas;
          this .presentaciones = this.data['0'].presentaciones;
          this .tiposDeIva     = this.data['0'].tiposDeIva;
          this .unidades       = this.data['0'].unidades;
          this .vias           = this.data['0'].vias;

          // --------- Ciclo de prueba para recorrer los campos de la estructura
          /*
          let a = this.data[0].marcas;
          a.forEach(o => {
            console .log( '+++' + o['nombre'] );
            this .marcas = o
            debugger;
          });
          --------- */
        });
        
        

        if (params['codigo'] !== undefined && params['codigo'] !== "undefined") {
          // Si el parametro codigo no esta definido entonces se trata de un nuevo registro
          this.esNuevo =  false;
          this.codigo = params['codigo'];
          this.service.getRecord(this.codigo)
              .then( obj => {
                      try{
                        this .vObj = obj;
                        this .frmProducto .setValue( this.vObj );
                        console .log( 'Nuevo: ' + this.esNuevo );
                        this .validateFields();
                        this .esNuevo =  false;
                      }
                      catch( error ){
                        console.log('-->Error al consultar producto');
                        console.log( error );
                      } 
              });
        } 
        else {
          try{
              this .vObj = new Producto();
              this .frmProducto .setValue( new Producto() );
              this .validateFields();
              this .esNuevo =  true;
              console .log( 'Nuevo: ' + this.esNuevo );
          }
          catch( error ){
              console.log('---> Error al presentar captura de nuevo item' + error);
          }
        }

    });

  } 

  ngOnDestroy() {
    this .sub .unsubscribe();
  }

  // Methods

  // Configuración de validaciones de campos del formulario
  validateFields() {   

    //--- PRECIOS Y DATOS ESTADISTICOS ---
    this .frmProducto .controls[ "codigo" ] .setValidators([ 
            Validators .required,
            Validators .minLength( 2 ), 
            Validators .maxLength( 10 ),
            Validators .pattern( Validate.RegExp.CODIGO )
    ]);
    this .frmProducto .controls[ "descripcion1" ] .setValidators([
            Validators .required,  
            Validators .minLength( 5 ), 
            Validators .maxLength( 80 ),
            Validators .pattern( Validate.RegExp.GENERAL )
    ]);
    this .frmProducto .controls[ "descripcion2" ] .setValidators([ 
            Validators .maxLength( 80 ),
            Validators .pattern( Validate.RegExp.GENERAL )
    ]);
    this .frmProducto .controls[ "codigo_barras" ] .setValidators([ 
            Validators .maxLength( 20 ),
            Validators .pattern( Validate.RegExp.CODIGO_BARRAS )
    ]);
    this .frmProducto .controls[ "referencia" ] .setValidators([ 
            Validators .maxLength( 20 ),
            Validators .pattern( Validate.RegExp.GENERAL )
    ]);
    this .frmProducto .controls[ "equivalencia" ] .setValidators([ 
            Validators .maxLength( 20 ),
            Validators .pattern( Validate.RegExp.GENERAL )
    ]);
    this .frmProducto .controls[ "unidad_empaque" ] .setValidators([ 
            Validators .maxLength( 12 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "ubicacion_bodega" ] .setValidators([ 
            Validators .maxLength( 10 ),
            Validators .pattern( Validate.RegExp.CODIGO )
    ]);
    //--- PRECIOS Y DATOS ESTADISTICOS ---
    this .frmProducto .controls[ "precio_venta1" ] .setValidators([
            Validators .required, 
            Validators .minLength( 3 ), 
            Validators .maxLength( 9 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "precio_venta2" ] .setValidators([ 
            Validators .maxLength( 9 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "precio_venta3" ] .setValidators([
            Validators .maxLength( 9 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "precio_venta4" ] .setValidators([ 
            Validators .maxLength( 9 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "precio_venta5" ] .setValidators([ 
            Validators .maxLength( 9 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "existencia" ] .setValidators([ 
            Validators .maxLength( 12 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "saldo_pedido" ] .setValidators([ 
            Validators .maxLength( 12 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "costo_promedio" ] .setValidators([ 
            Validators .maxLength( 12 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "costo_ultima_compra" ] .setValidators([ 
            Validators .maxLength( 12 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "costo_fob" ] .setValidators([ 
            Validators .maxLength( 12 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    //--- PARAMETROS (Legales) ---
    this .frmProducto .controls[ "registro_invima" ] .setValidators([ 
            Validators .maxLength( 30 ),
            Validators .pattern( Validate.RegExp.GENERAL )
    ]);           
    this .frmProducto .controls[ "numero_meses_garantia" ] .setValidators([ 
            Validators .maxLength( 2 ),
            Validators .pattern( Validate.RegExp.ENTERO )
    ]);  
    //--- PARAMETROS (Controles sobre valores y cantidades) ---
    this .frmProducto .controls[ "stock_minimo" ] .setValidators([ 
            Validators .maxLength( 12 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "stock_maximo" ] .setValidators([ 
            Validators .maxLength( 12 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "porc_max_dto_contado" ] .setValidators([ 
            Validators .maxLength( 5 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "porc_max_dto_credito" ] .setValidators([ 
            Validators .maxLength( 5 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    this .frmProducto .controls[ "porc_comision_venta" ] .setValidators([  
            Validators .maxLength( 5 ),
            Validators .pattern( Validate.RegExp.DECIMAL )
    ]);
    //--- PARAMETROS (Si/No) ---
    // No hay reglas todos son selectores obligatorios
    //--- PARAMETROS (Varios) ---
    this .frmProducto .controls[ "color_agenda" ] .setValidators([ 
            Validators .maxLength( 7 ),
            Validators .pattern( Validate.RegExp.HEXADECIMAL )
    ]);
    /*this .frmProducto .controls[ "presentacion" ] .setValidators([ 
            Validators .minLength( 10 ), 
            Validators .maxLength( 30 ),
            Validators .pattern( Validate.RegExp.ENTERO )
    ]);
    this .frmProducto .controls[ "via_administracion" ] .setValidators([ 
            Validators .minLength( 10 ), 
            Validators .maxLength( 30 ),
            Validators .pattern( Validate.RegExp.ENTERO )
    ]);
    this .frmProducto .controls[ "codigoBono" ] .setValidators([ 
            Validators .minLength( 10 ), 
            Validators .maxLength( 30 ),
            Validators .pattern( Validate.RegExp.ENTERO )
    ]);                
    //--- OTROS ---
    //--- CONTROL ---
    */
  }

  goToList( obj: Producto = null) {
    this .close .emit( obj );
    this .location .back();   
  }

  save(){
    this .service .save(this.frmProducto.value,this.esNuevo)
                  .then( obj => {
                    this.vObj = obj;
                    this.goToList( obj );
                  })
    .catch(error => this.error = error);
  }

  // Manejador de mensajes de ERROR de campos del formulario
  errors( name: string ){

    let resp: string = '';
    let error: any;

    // Configuracion de mensaje por campo
    let fields = { 
      //--- IDENTIFICACION DE PRODUCTO ---
      codigo: {
        required:      'Campo requerido.',
        minlength:     'Mínimo 2 o más caracteres.',
        maxlength:     'Hasta 10 caracteres.',
        pattern:       'Solo valores alfanuméricos sin espacios'
      },
      descripcion1: {
        required:      'Campo requerido.',
        minlength:     'Mínimo 10 o más números y/o caracteres.',
        maxlength:     'Hasta 80 números y/o caracteres.',
        pattern:       'Solo valores alfanuméricos y algunos símbolos.'
      },
      descripcion2: {
        maxlength:     'Hasta 80 números y/o caracteres.',
        pattern:       'Solo valores alfanuméricos y algunos símbolos.'
      },
      codigo_barras: {
        maxlength:     'Hasta 20 números y/o caracteres..',
        pattern:       'Solo valores alfabéticos.'
      },
      referencia: {
        maxlength:     'Debe tener hasta 20 números y/o caracteres..',
        pattern:       'Solo valores alfanuméricos.'
      },
      equivalencia: {
        maxlength:     'Hasta 20 números y/o caracteres..',
        pattern:       'Solo valores y algunos símbolos.'
      },
      unidad_empaque: {
        maxlength:     'Debe tener hasta 12 números.',
        pattern:       'Solo valores decimales.'
      },
      ubicacion_bodega: {
        maxlength:     'Debe tener hasta 10 números y/o caracteres..',
        pattern:       'Solo valores alfabéticos.'
      },
      //--- PRECIOS Y DATOS ESTADISTICOS ---
      precio_venta1: {
        required:      'Campo requerido.',
        minlength:     'Mínimo 3 o más números.',
        maxlength:     'Hasta 9 números.',
        pattern:       'Solo valores decimales.'
      },
      precio_venta2: {
        maxlength:     'Hasta 9 números.',
        pattern:       'Solo valores decimales.'
      },
      precio_venta3: {
        maxlength:     'Hasta 9 números.',
        pattern:       'Solo valores decimales.'
      },
      precio_venta4: {
        maxlength:     'Hasta 9 números.',
        pattern:       'Solo valores decimales.'
      },
      precio_venta5: {
        maxlength:     'Hasta 9 números.',
        pattern:       'Solo valores decimales.'
      },     
      existencia: {
        maxlength:     'Hasta 12 números.',
        pattern:       'Solo valores decimales.'
      }, 
      saldo_pedido: {
        maxlength:     'Hasta 12 números.',
        pattern:       'Solo valores decimales.'
      }, 
      costo_promedio: {
        maxlength:     'Hasta 12 números.',
        pattern:       'Solo valores decimales.'
      }, 
      costo_ultima_compra: {
        maxlength:     'Hasta 12 números.',
        pattern:       'Solo valores decimales.'
      }, 
      costo_fob: {
        maxlength:     'Hasta 12 números.',
        pattern:       'Solo valores decimales.'
      },                                                  
      //--- PARAMETROS (Legales) ---
      registro_invima: {
        maxlength:     'Hasta 30 caracteres.',
        pattern:       'Solo valores alfabéticos.'
      }, 
      numero_meses_garantia: {
        maxlength:     'Hasta 2 números.',
        pattern:       'Solo valores enteros.'
      }, 
      //--- PARAMETROS (Controles sobre valores y cantidades) ---
      stock_minimo: {
        minlength:     'Mínimo 1 o más números.',
        maxlength:     'Hasta 12 números.',
        pattern:       'Solo valores decimales.'
      },
      stock_maximo: {
        minlength:     'Mínimo 1 o más números.',
        maxlength:     'Hasta 12 números.',
        pattern:       'Solo valores decimales.'
      },
      porc_max_dto_contado: {
        minlength:     'Mínimo 1 o más números.',
        maxlength:     'Hasta 2 números.',
        pattern:       'Solo valores decimales.'
      },                  
      porc_max_dto_credito: {
        minlength:     'Mínimo 1 o más números.',
        maxlength:     'Hasta 2 números.',
        pattern:       'Solo valores decimales.'
      },
      porc_comision_venta: {
        minlength:     'Mínimo 1 o más números.',
        maxlength:     'Hasta 2 números.',
        pattern:       'Solo valores decimales.'
      },
      //--- PARAMETROS (Si/No) ---
      // No hay reglas todos son selectores obligatorios
      //--- PARAMETROS (Varios) ---
      color_agenda: {
        maxlength:     'Hasta 7 caracteres.',
        pattern:       'Solo valores hexadecimales.'
      },
      //--- OTROS ---
      //--- CONTROL ---
    }

    for ( error in this .frmProducto.controls[ name ].errors ){
        resp += fields[ name ][ error ] + ' ';
    }
    
    return resp;
  }
}