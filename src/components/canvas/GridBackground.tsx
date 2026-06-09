export const GridBackground = () => (
  // Use um tamanho fixo grande ou "100vw/100vh" para garantir que o canvas tenha área
  <div className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-none">
     {/* Seu grid aqui */}
     <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
  </div>
)