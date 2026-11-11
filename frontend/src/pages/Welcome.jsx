export default function Welcome({ navigate }) {
  return <main className="nx-splash"><button className="nx-splash-button" onClick={()=>navigate('/login')} aria-label="Ingresar al sistema NicaAcro"><span className="nx-splash-title">NICAACRO</span><span className="nx-splash-subtitle">FESTIVAL</span><strong>PLAY!</strong><small>HAGA CLIC PARA INGRESAR</small></button><span className="nx-splash-copyright">NICAACRO © 2026</span></main>;
}
