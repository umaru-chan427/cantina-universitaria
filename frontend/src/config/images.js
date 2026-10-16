export const IMAGENES_POR_CATEGORIA = {
  empanadas: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
  minutas: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600',
  bebidas: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600',
  postres: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600',
  cafeteria: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
};

export const IMAGEN_GENERICA =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';

export function resolverFoto(fotoUrl, categoriaSlug) {
  if (fotoUrl) return fotoUrl;
  if (categoriaSlug && IMAGENES_POR_CATEGORIA[categoriaSlug]) return IMAGENES_POR_CATEGORIA[categoriaSlug];
  return IMAGEN_GENERICA;
}
