import {Search,Info,ChevronLeft} from 'lucide-react';
export const StatCard=({label,value,helper,Icon})=><div className="stat-card"><div className="stat-label">{label} {Icon&&<Icon size={21}/>}</div><strong>{value}</strong><small>{helper}</small></div>;
export const Banner=({children,kind='info'})=><div role="status" className={`message ${kind}`}><Info size={17}/><span>{children}</span></div>;
export const Back=({navigate,to='/participantes',children='Regresar'})=><button className="back-btn" onClick={()=>navigate(to)}><ChevronLeft size={16}/>{children}</button>;
export const Empty=({children='No hay registros disponibles.'})=><div className="empty-state">{children}</div>;
export function PersonBadge({estado}){let active=estado==='ACTIVA'||estado==='ACTIVO';return <span className={`state-badge ${active?'active':'inactive'}`}>{active?'Activo':'Inactivo'}</span>}
export const SearchField=({value,onChange,placeholder='Buscar...',className=''})=><div className={'search-field '+className}><Search size={17}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></div>;
