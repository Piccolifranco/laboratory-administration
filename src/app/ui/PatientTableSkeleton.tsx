import React from "react";

export default function PatientTableSkeleton() {
  // 7 columns: Nombre y Apellido, Edad, DNI, Doctor/a, Obra Social, Última Visita, Acciones
  return (
    <tr>
      {[...Array(7)].map((_, idx) => (
        <td key={idx} className="py-5">
          <div className="flex justify-center">
            <div className="relative animate-pulse h-8 w-8">
              {/* Cell membrane */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 opacity-90 shadow-lg"></div>
              {/* Nucleus */}
              <div className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-green-300 opacity-80"></div>
              {/* Shine */}
              <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white opacity-30"></div>
            </div>
          </div>
        </td>
      ))}
    </tr>
  );
}

