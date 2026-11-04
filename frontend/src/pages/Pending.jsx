import React from 'react';
import {Wrench,ArrowLeft} from 'lucide-react';
import {Banner} from '../components/UI';
export default function Pending({title,detail,navigate}){return <section className="white-panel pending-page"><Wrench size={37}/><h2>{title}</h2><p>{detail||'El backend proporcionado todavía no tiene rutas, modelos ni controladores para este módulo. Su implementación visual definitiva se realizará cuando se cuente con el diseño correspondiente.'}</p><Banner>No se crean ni modifican datos desde esta pantalla.</Banner><button className="outline-button" onClick={()=>navigate('/dashboard')}><ArrowLeft size={16}/> Volver al Dashboard</button></section>}
