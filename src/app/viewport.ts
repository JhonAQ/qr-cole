import { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#07aee1',
  viewportFit: 'cover', // Para dispositivos con notch
  interactiveWidget: 'resizes-content', // Para teclados virtuales
};
