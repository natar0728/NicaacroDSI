// Exclusivamente visuales: no representan datos guardados en MongoDB.
export const examplePeople=[
  {_id:'demo-1',tipoPersona:'PARTICIPANTE',primerNombre:'Valeria',primerApellido:'Montoya',tipoIdentificacion:'CEDULA',numeroIdentificacion:'NI-204831',paisEmisor:'Nicaragua',correo:'valeria@gmail.com',telefono:'+505 8888-8888',estado:'ACTIVA'},
  {_id:'demo-2',tipoPersona:'PARTICIPANTE',primerNombre:'Carlos',primerApellido:'Espinoza',tipoIdentificacion:'CEDULA',numeroIdentificacion:'CR-119023',paisEmisor:'Costa Rica',correo:'carlos@hotmail.com',telefono:'+506 2222-2222',estado:'ACTIVA'},
  {_id:'demo-3',tipoPersona:'PARTICIPANTE',primerNombre:'Sofía',primerApellido:'Ramírez',tipoIdentificacion:'PASAPORTE',numeroIdentificacion:'MX-884721',paisEmisor:'México',correo:'sofia.r@gmail.com',telefono:'+52 3333-3333',estado:'ACTIVA'},
  {_id:'demo-4',tipoPersona:'PARTICIPANTE',primerNombre:'Diego',primerApellido:'Herrera',tipoIdentificacion:'CEDULA',numeroIdentificacion:'NI-338812',paisEmisor:'Nicaragua',correo:'diego.h@yahoo.com',telefono:'+505 7777-7777',estado:'INACTIVA'},
  {_id:'demo-5',tipoPersona:'PARTICIPANTE',primerNombre:'Luisa',primerApellido:'Fernández',tipoIdentificacion:'PASAPORTE',numeroIdentificacion:'GT-220193',paisEmisor:'Guatemala',correo:'luisa@gmail.com',telefono:'+502 4444-4444',estado:'ACTIVA'},
];
export const exampleEvents=[
 {_id:'demo-event-1',codigo:'EVT-2026-014',nombre:'Encuentro Acro · Noviembre 2026',estado:'En curso',inicio:'05 de noviembre de 2026',fin:'05 de noviembre de 2026',lugar:'Centro de Encuentros · Sede Demo',participantes:128,ocupacion:'80%',staff:18},
 {_id:'demo-event-2',codigo:'EVT-2026-015',nombre:'Carrera de 5K · NICAcro Festival Play 2026',estado:'Planificado',inicio:'23 de noviembre de 2026 · 07:00 h',fin:'23 de noviembre de 2026',lugar:'Parque Luis Alfonso Velásquez',participantes:0,ocupacion:'—',staff:0}
];
export const fullName=p=>[p?.primerNombre,p?.segundoNombre,p?.primerApellido,p?.segundoApellido].filter(Boolean).join(' ')||'Sin nombre';
export const personCode=p=>p?.numeroIdentificacion||p?.identificadorAlternativo||p?._id?.slice(-8)?.toUpperCase()||'—';
export const idLabel={CEDULA:'Cédula / DNI',PASAPORTE:'Pasaporte',DOCUMENTO_EXTRANJERO:'Documento extranjero',SIN_DOCUMENTO:'Sin documento'};
