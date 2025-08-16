'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';

export default function StudentList() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [presentesHoy, setPresentesHoy] = useState([]);

  useEffect(() => {
    fetchAlumnos();
    fetchPresentesHoy();
    
    // Suscripción a cambios en tiempo real
    const asistenciasSubscription = supabase
      .channel('asistencias-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'asistencias' }, 
        () => {
          fetchPresentesHoy();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(asistenciasSubscription);
    };
  }, []);

  const fetchAlumnos = async () => {
    try {
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .order('apellidos', { ascending: true });
      
      if (error) throw error;
      
      setAlumnos(data || []);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
      toast.error('Error al cargar la lista de alumnos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPresentesHoy = async () => {
    try {
      // Obtener la fecha de hoy en formato ISO
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();
      
      // Obtener los alumnos presentes hoy (última asistencia = entrada)
      const { data, error } = await supabase
        .from('asistencias')
        .select(`
          id_alumno,
          tipo,
          hora,
          alumnos (
            id,
            nombre,
            apellidos
          )
        `)
        .gte('hora', todayStr)
        .order('hora', { ascending: false });
      
      if (error) throw error;
      
      // Filtrar para obtener el último registro de cada alumno
      const ultimosRegistros = {};
      data.forEach(registro => {
        const alumnoId = registro.id_alumno;
        if (!ultimosRegistros[alumnoId] || new Date(registro.hora) > new Date(ultimosRegistros[alumnoId].hora)) {
          ultimosRegistros[alumnoId] = registro;
        }
      });
      
      // Filtrar solo aquellos cuyo último registro es "entrada"
      const presentes = Object.values(ultimosRegistros)
        .filter(registro => registro.tipo === 'entrada')
        .map(registro => registro.id_alumno);
      
      setPresentesHoy(presentes);
    } catch (error) {
      console.error('Error al cargar presentes:', error);
    }
  };

  if (loading) return <div>Cargando alumnos...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Lista de Alumnos</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Total: {alumnos.length} alumnos | Presentes hoy: {presentesHoy.length}
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alumno
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {alumnos.map((alumno) => (
              <tr key={alumno.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {alumno.apellidos}, {alumno.nombre}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{alumno.contacto_padres}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {presentesHoy.includes(alumno.id) ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Presente
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Ausente
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}