// Imports del core de Angular 2 necesarios para este componente
//import { RouterConfig }         from '@angular/router';
import { Routes, RouterModule } from '@angular/router';

// Imports personalizados necesarios para este componente
import { TablaGeneralList }     from './tabla-general-list.component';
import { TablaGeneralDetail }   from './tabla-general-detail.component';

// Constante con los PATHs del componente
export const TABLA_GENERAL_ROUTES: Routes = [
  { path: 'tabla_general'                     , component: TablaGeneralList },
  { path: 'tabla_general/:codigo'             , component: TablaGeneralDetail },
  { path: 'marca'                             , component: TablaGeneralList },
  { path: 'marca/:codigo'                     , component: TablaGeneralDetail },
  { path: 'presentacion_medicamento'          , component: TablaGeneralList },
  { path: 'presentacion_medicamento/:codigo'  , component: TablaGeneralDetail },
  { path: 'vias_administracion'               , component: TablaGeneralList },
  { path: 'vias_administracion/:codigo'       , component: TablaGeneralDetail },
  { path: 'riesgo_procedimiento'              , component: TablaGeneralList },
  { path: 'riesgo_procedimiento/:codigo'      , component: TablaGeneralDetail }
];
