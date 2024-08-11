"use client";
import React, { useEffect } from "react";
import { Paciente } from "../../../../types/supabase";
import { SubmitHandler, useForm } from "react-hook-form";
import { updatePaciente } from "../../remoteDataSource/supabase";
import { useRemoveQueryParam } from "@/app/utils/removeQueryParams";
import { useRouter } from "next/navigation";

interface EditPacienteDialogBodyProps {
  paciente: Paciente; // Los datos del paciente a editar
}

function EditPacienteDialogBody({ paciente }: EditPacienteDialogBodyProps) {
  const { removeQueryParams } = useRemoveQueryParam();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Paciente>({
    defaultValues: paciente,
  });
  const router = useRouter();
  const onSubmit: SubmitHandler<Paciente> = async (data) => {
    const updatedPaciente = await updatePaciente(paciente.id, data);
    removeQueryParams();
    console.log({ updatedPaciente });
    if (!updatedPaciente) {
      console.error("Error al actualizar paciente");
      // Puedes mostrar un mensaje de error en la interfaz de usuario
    } else {
      console.log("Paciente actualizado exitosamente:", updatedPaciente);
      // Puedes mostrar un mensaje de éxito en la interfaz de usuario
    }
    router.refresh();
  };

  return (
    <div className="w-full mx-auto" data-v0-t="card">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div className="space-y-2 flex flex-col w-full items-start">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="firstName"
          >
            Nombre
          </label>
          <input
            {...register("firstName", { required: true })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="firstName"
            placeholder="Ingrese su nombre"
          />
          {errors.firstName && (
            <span className="text-red-600">Nombre es requerido</span>
          )}
        </div>
        <div className="space-y-2 flex flex-col w-full items-start">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="lastName"
          >
            Apellido
          </label>
          <input
            {...register("lastName", { required: true })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="lastName"
            placeholder="Ingrese su apellido"
          />
          {errors.lastName && (
            <span className="text-red-600">Apellido es requerido</span>
          )}
        </div>
        <div className="space-y-2 flex flex-col w-full items-start">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="age"
          >
            Edad
          </label>
          <input
            {...register("age", { required: true, valueAsNumber: true })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="age"
            placeholder="Ingrese su edad"
            type="number"
          />
          {errors.age && (
            <span className="text-red-600">Edad es requerida</span>
          )}
        </div>
        <div className="space-y-2 flex flex-col w-full items-start">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="dni"
          >
            DNI
          </label>
          <input
            {...register("dni", { required: true, valueAsNumber: true })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="dni"
            placeholder="Ingrese su DNI"
            type="number"
          />
          {errors.dni && <span className="text-red-600">DNI es requerido</span>}
        </div>
        <div className="space-y-2 flex flex-col w-full items-start">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="doctor"
          >
            Doctor
          </label>
          <input
            {...register("doctor", { required: true })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="doctor"
            placeholder="Ingrese el nombre del doctor"
          />
          {errors.doctor && (
            <span className="text-red-600">Doctor es requerido</span>
          )}
        </div>
        <div className="space-y-2 flex flex-col w-full items-start">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="obraSocial"
          >
            Obra Social
          </label>
          <input
            {...register("obraSocial", { required: true })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="obraSocial"
            placeholder="Ingrese su obra social"
          />
          {errors.obraSocial && (
            <span className="text-red-600">Obra Social es requerida</span>
          )}
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}

export { EditPacienteDialogBody };