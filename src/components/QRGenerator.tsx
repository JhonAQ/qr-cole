'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';

export default function QRGenerator() {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [contacto, setContacto] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    if (!nombre || !apellidos || !contacto) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    
    // Generar un código único para el QR
    const codigo_qr = `ALU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    try {
      // Generar imagen QR
      const qrDataUrl = await QRCode.toDataURL(codigo_qr);
      setQrImage(qrDataUrl);
      
      // Guardar en Supabase
      const { error } = await supabase.from('alumnos').insert({
        nombre,
        apellidos,
        codigo_qr,
        contacto_padres: contacto
      });
      
      if (error) throw error;
      
      toast.success('Alumno registrado con éxito');
    } catch (error) {
      console.error(error);
      toast.error('Error al generar QR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Registrar nuevo alumno</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Apellidos</label>
          <input
            type="text"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Contacto padres (email o teléfono)</label>
          <input
            type="text"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <button
          onClick={generateQR}
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {loading ? 'Generando...' : 'Generar QR'}
        </button>
      </div>
      
      {qrImage && (
        <div className="mt-6 text-center">
          <h3 className="text-lg font-medium mb-2">QR Generado</h3>
          <div className="inline-block p-2 bg-white border border-gray-300 rounded-md">
            <img src={qrImage} alt="QR Code" className="w-48 h-48" />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Nombre: {nombre} {apellidos}
          </p>
          <button
            onClick={() => window.print()}
            className="mt-2 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            Imprimir QR
          </button>
        </div>
      )}
    </div>
  );
}