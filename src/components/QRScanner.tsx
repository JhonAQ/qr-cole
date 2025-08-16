'use client';

import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [alumno, setAlumno] = useState(null);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [tipoRegistro, setTipoRegistro] = useState('entrada');
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    // Cleanup al desmontar el componente
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanner = () => {
    const html5QrCode = new Html5Qrcode("reader");
    setScanner(html5QrCode);
    
    const qrCodeSuccessCallback = async (decodedText) => {
      if (decodedText !== lastScannedCode) {
        setLastScannedCode(decodedText);
        
        try {
          // Buscar alumno con el código QR
          const { data, error } = await supabase
            .from('alumnos')
            .select('*')
            .eq('codigo_qr', decodedText)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setAlumno(data);
            
            // Verificar último registro para determinar entrada/salida automáticamente
            const { data: ultimoRegistro } = await supabase
              .from('asistencias')
              .select('tipo')
              .eq('id_alumno', data.id)
              .order('hora', { ascending: false })
              .limit(1);
            
            if (ultimoRegistro && ultimoRegistro.length > 0) {
              // Si el último registro fue entrada, ahora es salida y viceversa
              setTipoRegistro(ultimoRegistro[0].tipo === 'entrada' ? 'salida' : 'entrada');
            }
            
            toast.success(`QR escaneado: ${data.nombre} ${data.apellidos}`);
          } else {
            toast.error('Alumno no encontrado');
          }
        } catch (error) {
          console.error(error);
          toast.error('Error al procesar QR');
        }
      }
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback
    ).catch((err) => {
      console.error(err);
      toast.error('Error al iniciar la cámara');
    });
    
    setScanning(true);
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.stop().then(() => {
        setScanning(false);
      }).catch(err => {
        console.error(err);
      });
    }
  };

  const registrarAsistencia = async () => {
    if (!alumno) return;
    
    try {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuario no autenticado');
      
      // Registrar asistencia
      const { error } = await supabase.from('asistencias').insert({
        id_alumno: alumno.id,
        id_profesor: user.id,
        tipo: tipoRegistro
      });
      
      if (error) throw error;
      
      // Enviar notificación (simulado)
      await enviarNotificacion(alumno, tipoRegistro);
      
      toast.success(`Asistencia registrada: ${tipoRegistro}`);
      
      // Limpiar para siguiente escaneo
      setAlumno(null);
      setLastScannedCode('');
    } catch (error) {
      console.error(error);
      toast.error('Error al registrar asistencia');
    }
  };

  const enviarNotificacion = async (alumno, tipo) => {
    // Simulación de envío de notificación
    console.log(`Notificación enviada a: ${alumno.contacto_padres}`);
    console.log(`Mensaje: Su hijo/a ${alumno.nombre} ${alumno.apellidos} ha registrado ${tipo} a la escuela.`);
    
    // Aquí se implementaría la integración real con el servicio de email o WhatsApp
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Escanear Código QR</h2>
      
      <div id="reader" className="w-full h-64 border border-gray-300 rounded-md overflow-hidden"></div>
      
      <div className="mt-4 space-y-4">
        {!scanning ? (
          <button
            onClick={startScanner}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Iniciar Escáner
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="w-full px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Detener Escáner
          </button>
        )}
        
        {alumno && (
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="font-medium">Alumno detectado</h3>
            <p>{alumno.nombre} {alumno.apellidos}</p>
            
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Tipo de registro</label>
              <select
                value={tipoRegistro}
                onChange={(e) => setTipoRegistro(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </div>
            
            <button
              onClick={registrarAsistencia}
              className="mt-3 w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Registrar {tipoRegistro}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}